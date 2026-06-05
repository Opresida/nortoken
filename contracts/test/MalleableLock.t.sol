// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {MalleableLiquidityLock} from "../src/lock/MalleableLiquidityLock.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {IERC20Minimal} from "v4-core/src/interfaces/external/IERC20Minimal.sol";

/// @notice Invariantes do lock maleável:
///   • principal travado: withdraw antes do unlock SEMPRE reverte;
///   • range ajustável só pelo keeper; bounds respeitados;
///   • o keeper NUNCA recebe tokens (rebalance não tem destino/saque);
///   • após o unlock, o dono recupera o principal.
contract MalleableLockTest is Test, Deployers {
    using CurrencyLibrary for Currency;

    MalleableLiquidityLock internal lock;
    address internal keeper = makeAddr("keeper");
    address internal stranger = makeAddr("stranger");

    uint128 internal constant PRINCIPAL = 1e15;
    uint64 internal constant LOCK_DAYS = 30 days;

    function setUp() public {
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();
        lock = new MalleableLiquidityLock(manager);

        // pool sem hook, só pra testar o lock isoladamente
        (key,) = initPool(currency0, currency1, IHooks(address(0)), 3000, SQRT_PRICE_1_1);

        // este contrato é o projectOwner; aprova o lock pra puxar os tokens no deposit
        IERC20Minimal(Currency.unwrap(currency0)).approve(address(lock), type(uint256).max);
        IERC20Minimal(Currency.unwrap(currency1)).approve(address(lock), type(uint256).max);
    }

    function _deposit() internal returns (uint256 lockId) {
        lockId = lock.depositPrincipal(key, -600, 600, PRINCIPAL, -6000, 6000, LOCK_DAYS, keeper);
    }

    function test_DepositLocksPrincipal() public {
        uint256 id = _deposit();
        (, address owner, uint128 principal,,,,, uint64 unlockTime, address k,) = lock.locks(id);
        assertEq(owner, address(this));
        assertEq(principal, PRINCIPAL);
        assertEq(k, keeper);
        assertEq(unlockTime, uint64(block.timestamp) + LOCK_DAYS);
    }

    function test_WithdrawBlockedBeforeUnlock() public {
        uint256 id = _deposit();
        vm.expectRevert(MalleableLiquidityLock.StillLocked.selector);
        lock.withdrawPrincipal(id);
    }

    function test_OnlyKeeperCanRebalance() public {
        uint256 id = _deposit();
        vm.prank(stranger);
        vm.expectRevert(MalleableLiquidityLock.NotKeeper.selector);
        lock.rebalance(id, -300, 300);
    }

    function test_RebalanceRespectsBounds() public {
        uint256 id = _deposit();
        vm.prank(keeper);
        vm.expectRevert(MalleableLiquidityLock.RangeOutOfBounds.selector);
        lock.rebalance(id, -9000, 300); // fora de [-6000, 6000]
    }

    /// O CORAÇÃO: keeper reposiciona o range e NÃO recebe nenhum token.
    function test_KeeperRebalancesButGetsNothing() public {
        uint256 id = _deposit();

        uint256 k0Before = currency0.balanceOf(keeper);
        uint256 k1Before = currency1.balanceOf(keeper);

        vm.prank(keeper);
        lock.rebalance(id, -300, 300); // range mais estreito (sobra fica no cofre)

        // range mudou
        (,,, int24 tl, int24 tu,,,,,) = lock.locks(id);
        assertEq(tl, -300);
        assertEq(tu, 300);

        // keeper não recebeu NADA
        assertEq(currency0.balanceOf(keeper), k0Before, "keeper nao pode receber token0");
        assertEq(currency1.balanceOf(keeper), k1Before, "keeper nao pode receber token1");
    }

    function test_KeeperCannotDrainAcrossManyRebalances() public {
        uint256 id = _deposit();
        // reposicionamentos dentro do capital (estreitando) — vários seguidos
        int24[4] memory lowers = [int24(-540), -420, -300, -180];
        int24[4] memory uppers = [int24(540), 420, 300, 180];
        for (uint256 i = 0; i < 4; i++) {
            vm.prank(keeper);
            lock.rebalance(id, lowers[i], uppers[i]);
        }
        // depois de vários rebalances, o keeper continua sem NADA
        assertEq(currency0.balanceOf(keeper), 0);
        assertEq(currency1.balanceOf(keeper), 0);
    }

    function test_WithdrawReturnsPrincipalAfterUnlock() public {
        uint256 id = _deposit();
        uint256 b0 = currency0.balanceOf(address(this));
        uint256 b1 = currency1.balanceOf(address(this));

        vm.warp(block.timestamp + LOCK_DAYS + 1);
        lock.withdrawPrincipal(id);

        // recuperou liquidez (saldo voltou a subir nos dois tokens)
        assertGt(currency0.balanceOf(address(this)), b0);
        assertGt(currency1.balanceOf(address(this)), b1);

        // lock inativo
        (,,,,,,,,, bool active) = lock.locks(id);
        assertFalse(active);
    }
}
