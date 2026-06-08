// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";

import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {MazariSwapHookV3} from "../src/hook/MazariSwapHookV3.sol";
import {MalleableLiquidityLock} from "../src/lock/MalleableLiquidityLock.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";

/// @notice A linha de montagem ponta-a-ponta: passo 1 (token) + passo 2 (pool+lock),
///         nos dois tipos de âncora (ETH nativo e ERC20/USDC), garantindo que:
///           • o cliente vira owner e recebe o supply; o registro/eventos saem;
///           • a taxa de emissão cobra em USDC só quando ligada (OFF em testnet);
///           • o lock fica com keeper = Mazari (o passivo) e o cliente recupera no unlock;
///           • a FACTORY NUNCA retém fundos (token/USDC/ETH) — invariante central.
contract NortokenFactoryTest is Test, Deployers {
    using PoolIdLibrary for PoolKey;

    MazariSwapHookV3 internal hook;
    MalleableLiquidityLock internal lock;
    NortokenFactory internal factory;
    MockERC20 internal usdc;

    address internal treasury = makeAddr("treasury");
    address internal mazariKeeper = makeAddr("mazariKeeper");

    uint256 internal constant ISSUANCE_FEE = 39e6; // 39 USDC (6 casas)

    function setUp() public {
        deployFreshManagerAndRouters();

        // hook num endereço com os flag-bits corretos (como no teste do hook)
        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
                | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        address hookAddr = address(flags | (uint160(0x4444) << 144));
        // owner explícito = este contrato de teste (sobrevive ao CREATE2 no deploy real)
        deployCodeTo(
            "MazariSwapHookV3.sol:MazariSwapHookV3",
            abi.encode(IPoolManager(address(manager)), treasury, address(this)),
            hookAddr
        );
        hook = MazariSwapHookV3(hookAddr);

        lock = new MalleableLiquidityLock(manager);
        usdc = new MockERC20("USD Coin", "USDC", 6);

        factory = new NortokenFactory(
            manager, hook, lock, address(usdc), treasury, mazariKeeper, ISSUANCE_FEE, false /* feeEnabled OFF (testnet) */
        );
        lock.setFactory(address(factory));
        hook.setRegistrar(address(factory)); // factory pode setar a taxa do cliente por pool

        // Mazari pré-registra a âncora USDC (ETH já é âncora por construção do hook).
        hook.setAnchor(Currency.wrap(address(usdc)), true);
    }

    // (o `receive()` que aceita o refund de ETH e o principal devolvido vem do Deployers)

    // ─────────────────────────── helpers ───────────────────────────

    function _params() internal pure returns (NortokenERC20.InitParams memory p) {
        p = NortokenERC20.InitParams({
            name: "Client Token",
            symbol: "CLT",
            initialSupply: 1_000_000 ether,
            maxCap: 0,
            mintable: false,
            initialOwner: address(0xBEEF), // será sobrescrito pela factory com o msg.sender
            antiSnipeBlocks: 0,
            tradeCooldownSec: 0,
            maxWalletBps: 0,
            maxTxBps: 0, taxBps: 0, taxTreasury: address(0)
        });
    }

    function _mkToken() internal returns (NortokenERC20 token) {
        token = NortokenERC20(factory.createToken(_params()));
    }

    function _lp() internal pure returns (NortokenFactory.LockParams memory) {
        return NortokenFactory.LockParams({
            tickLower: -6000,
            tickUpper: 6000,
            liquidity: 1e15,
            minTick: -6000,
            maxTick: 6000,
            lockDuration: 30 days
        });
    }

    function _keeperOf(uint256 lockId) internal view returns (address k) {
        (,,,,,,,, k,) = lock.locks(lockId);
    }

    // ═══════════════════════ PASSO 1 — createToken ═══════════════════════

    function test_CreateToken_OwnerSupplyAndRegistry() public {
        NortokenERC20 token = _mkToken();
        assertEq(token.owner(), address(this), "cliente (msg.sender) vira owner");
        assertEq(token.balanceOf(address(this)), 1_000_000 ether, "supply vai pro cliente");

        assertTrue(factory.isNortoken(address(token)));
        assertEq(factory.tokenCreator(address(token)), address(this));
        address[] memory mine = factory.getCreatorTokens(address(this));
        assertEq(mine.length, 1);
        assertEq(mine[0], address(token));
    }

    function test_CreateToken_FeeOff_NoUsdcNeeded() public {
        // feeEnabled=false: cria sem ter um único USDC nem aprovar nada.
        uint256 t0 = usdc.balanceOf(treasury);
        _mkToken();
        assertEq(usdc.balanceOf(treasury), t0, "sem taxa em testnet");
    }

    function test_CreateToken_FeeOn_PullsUsdc() public {
        factory.setFeeConfig(true, ISSUANCE_FEE);
        usdc.mint(address(this), ISSUANCE_FEE);
        usdc.approve(address(factory), ISSUANCE_FEE);

        uint256 t0 = usdc.balanceOf(treasury);
        _mkToken();
        assertEq(usdc.balanceOf(treasury) - t0, ISSUANCE_FEE, "cobra 39 USDC no tesouro");
        assertEq(usdc.balanceOf(address(this)), 0, "cliente pagou a taxa");
    }

    // ═══════════════════ PASSO 2 — createPoolAndLock (ETH) ═══════════════════

    function test_CreatePoolAndLock_EthAnchor() public {
        NortokenERC20 token = _mkToken();
        token.setExempt(address(lock), true); // pré-condição mecânica (rebalance do keeper)
        token.approve(address(lock), type(uint256).max);
        vm.deal(address(this), 1 ether);

        Currency anchor = Currency.wrap(address(0)); // ETH nativo

        uint256 tokBefore = token.balanceOf(address(this));
        (PoolKey memory key, uint256 lockId) =
            factory.createPoolAndLock{value: 0.05 ether}(address(token), anchor, 3000, 60, SQRT_PRICE_1_1, _lp(), 0, address(0));

        // keeper = Mazari (o passivo gerenciado)
        assertEq(_keeperOf(lockId), mazariKeeper, "keeper deve ser a Mazari");

        // registro do passivo
        NortokenFactory.PoolPosition memory pos = factory.getPoolPosition(address(token));
        assertEq(pos.lockId, lockId);
        assertEq(pos.keeper, mazariKeeper);
        assertEq(pos.lock, address(lock));
        uint256[] memory mine = factory.getClientLocks(address(this));
        assertEq(mine.length, 1);
        assertEq(mine[0], lockId);

        // INVARIANTE: a factory nunca retém fundos
        assertEq(address(factory).balance, 0, "factory sem ETH");
        assertEq(token.balanceOf(address(factory)), 0, "factory sem token");

        // o cliente gastou token na liquidez (foi pra pool, travado)
        assertLt(token.balanceOf(address(this)), tokBefore, "token do cliente foi pra liquidez");

        // par estabelecido com ETH como currency0 (0x0 < qualquer token)
        assertEq(Currency.unwrap(key.currency0), address(0));
        assertEq(Currency.unwrap(key.currency1), address(token));
    }

    function test_CreatePoolAndLock_Erc20Anchor() public {
        NortokenERC20 token = _mkToken();
        token.setExempt(address(lock), true);
        token.approve(address(lock), type(uint256).max);

        usdc.mint(address(this), 1e24); // âncora USDC abundante
        usdc.approve(address(lock), type(uint256).max);

        Currency anchor = Currency.wrap(address(usdc));
        (, uint256 lockId) =
            factory.createPoolAndLock(address(token), anchor, 3000, 60, SQRT_PRICE_1_1, _lp(), 0, address(0));

        assertEq(_keeperOf(lockId), mazariKeeper);
        // factory não retém nem token nem USDC
        assertEq(token.balanceOf(address(factory)), 0);
        assertEq(usdc.balanceOf(address(factory)), 0);
    }

    /// A factory registra a TAXA DO CLIENTE no hook ao criar a pool (a promessa da tela).
    function test_CreatePoolAndLock_RegistersClientFee() public {
        NortokenERC20 token = _mkToken();
        token.setExempt(address(lock), true);
        token.approve(address(lock), type(uint256).max);
        vm.deal(address(this), 1 ether);

        address clientTreasury = makeAddr("clientTreasury");
        uint16 clientBps = 200; // 2%

        (PoolKey memory key,) = factory.createPoolAndLock{value: 0.05 ether}(
            address(token), Currency.wrap(address(0)), 3000, 60, SQRT_PRICE_1_1, _lp(), clientBps, clientTreasury
        );

        (uint16 bps, address treasury) = hook.clientFee(key.toId());
        assertEq(bps, clientBps, "taxa do cliente registrada no hook");
        assertEq(treasury, clientTreasury, "tesouro do cliente registrado");
    }

    /// Teto duro: protocolo (0,2%) + cliente nao pode passar de 5% (500 bps) — reverte.
    function test_Revert_ClientFeeAboveCap() public {
        NortokenERC20 token = _mkToken();
        token.setExempt(address(lock), true);
        token.approve(address(lock), type(uint256).max);
        vm.deal(address(this), 1 ether);

        vm.expectRevert(MazariSwapHookV3.FeeAboveCap.selector);
        factory.createPoolAndLock{value: 0.05 ether}(
            address(token), Currency.wrap(address(0)), 3000, 60, SQRT_PRICE_1_1, _lp(), 500, makeAddr("t")
        );
    }

    function test_ProjectOwnerRecoversPrincipalAtUnlock() public {
        NortokenERC20 token = _mkToken();
        token.setExempt(address(lock), true);
        token.approve(address(lock), type(uint256).max);
        vm.deal(address(this), 1 ether);

        (, uint256 lockId) = factory.createPoolAndLock{value: 0.05 ether}(
            address(token), Currency.wrap(address(0)), 3000, 60, SQRT_PRICE_1_1, _lp(), 0, address(0)
        );

        uint256 tokBefore = token.balanceOf(address(this));
        vm.warp(block.timestamp + 30 days + 1);
        lock.withdrawPrincipal(lockId); // o cliente (projectOwner) recupera

        assertGt(token.balanceOf(address(this)), tokBefore, "cliente recupera o principal (token)");
        (,,,,,,,,, bool active) = lock.locks(lockId);
        assertFalse(active, "lock encerrado apos o saque");
    }

    // ─────────────────────────── reverts / guards ───────────────────────────

    function test_Revert_UnregisteredAnchor() public {
        NortokenERC20 token = _mkToken();
        token.setExempt(address(lock), true);
        MockERC20 random = new MockERC20("Rand", "RND", 18);
        vm.expectRevert(NortokenFactory.AnchorNotRegistered.selector);
        factory.createPoolAndLock(address(token), Currency.wrap(address(random)), 3000, 60, SQRT_PRICE_1_1, _lp(), 0, address(0));
    }

    function test_Revert_LockNotExempt() public {
        NortokenERC20 token = _mkToken(); // sem setExempt do lock
        vm.expectRevert(NortokenFactory.LockNotExempt.selector);
        factory.createPoolAndLock(address(token), Currency.wrap(address(0)), 3000, 60, SQRT_PRICE_1_1, _lp(), 0, address(0));
    }

    function test_Revert_NotTokenCreator() public {
        NortokenERC20 token = _mkToken();
        token.setExempt(address(lock), true);
        vm.prank(makeAddr("intruso"));
        vm.expectRevert(NortokenFactory.NotTokenCreator.selector);
        factory.createPoolAndLock(address(token), Currency.wrap(address(0)), 3000, 60, SQRT_PRICE_1_1, _lp(), 0, address(0));
    }

    function test_Revert_NonFactoryCannotDepositFor() public {
        // só a factory pode usar depositPrincipalFor (impede roubar o projectOwner)
        PoolKey memory key;
        vm.expectRevert(MalleableLiquidityLock.NotFactory.selector);
        lock.depositPrincipalFor(address(this), address(this), key, -60, 60, 1e15, -6000, 6000, 1 days, mazariKeeper);
    }

    function test_Revert_SetFactoryOnlyOnceByDeployer() public {
        vm.expectRevert(MalleableLiquidityLock.FactoryAlreadySet.selector);
        lock.setFactory(address(0xdead));
    }
}
