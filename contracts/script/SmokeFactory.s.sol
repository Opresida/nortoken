// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {MalleableLiquidityLock} from "../src/lock/MalleableLiquidityLock.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";

/// @notice Smoke test E2E da linha de montagem em Base Sepolia: usa a FACTORY real para
///         (1) criar um token, (2) criar a pool ETH + travar a liquidez no lock (keeper =
///         Mazari) e (3) disparar um swap que aciona o hook. Prova a esteira ponta-a-ponta.
contract SmokeFactory is Script {
    IPoolManager constant MANAGER = IPoolManager(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408);
    NortokenFactory constant FACTORY = NortokenFactory(0xB6BcE4CaCF4285e64de79Bcbf5Aee69cC65c9C78);
    MalleableLiquidityLock constant LOCK = MalleableLiquidityLock(0x10ee52ad60b5b8a0d6bec6F31D49a466e423e9c2);
    uint160 constant SQRT_PRICE_1_1 = 79228162514264337593543950336;
    // tesouro do "cliente" — endereço distinto e normal (não o sender), pra provar o fee duplo
    address constant CLIENT_TREASURY = 0x00000000000000000000000000000000C0FfeE00;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        vm.startBroadcast(pk);

        // 1) PASSO 1 — criar o token pela factory
        NortokenERC20.InitParams memory p = NortokenERC20.InitParams({
            name: "Smoke Token",
            symbol: "SMK",
            initialSupply: 1_000_000 ether,
            maxCap: 0,
            mintable: false,
            initialOwner: address(0), // factory sobrescreve com o msg.sender
            antiSnipeBlocks: 0,
            tradeCooldownSec: 0,
            maxWalletBps: 0,
            maxTxBps: 0, taxBps: 0, taxTreasury: address(0)
        });
        address token = FACTORY.createToken(p);
        console.log("token criado:", token);

        // pre-condicoes do passo 2 (owner = cliente)
        NortokenERC20(token).enableTrading();
        NortokenERC20(token).setExempt(address(LOCK), true);
        NortokenERC20(token).approve(address(LOCK), type(uint256).max);

        // 2) PASSO 2 — "Crie sua pool": pool ETH + lock (keeper = Mazari)
        NortokenFactory.LockParams memory lp = NortokenFactory.LockParams({
            tickLower: -6000,
            tickUpper: 6000,
            liquidity: 1e15,
            minTick: -6000,
            maxTick: 6000,
            lockDuration: 30 days
        });
        // taxa do cliente 2% (200 bps) → tesouro distinto, pra provar o fee duplo on-chain
        (PoolKey memory key, uint256 lockId) = FACTORY.createPoolAndLock{value: 0.02 ether}(
            token, Currency.wrap(address(0)), 3000, 60, SQRT_PRICE_1_1, lp, 200, CLIENT_TREASURY
        );
        (,,,,,,,, address keeper,) = LOCK.locks(lockId);
        console.log("pool+lock criado. lockId:", lockId);
        console.log("keeper (deve ser Mazari):", keeper);

        // 3) swap real ETH -> token: aciona o hook (beforeSwap captura 0,2% no ETH)
        PoolSwapTest swapRouter = new PoolSwapTest(MANAGER);
        IPoolManager.SwapParams memory sp = IPoolManager.SwapParams({
            zeroForOne: true,
            amountSpecified: -0.002 ether,
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        });
        swapRouter.swap{value: 0.002 ether}(
            key, sp, PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}), ""
        );
        console.log("swap executado (hook acionado). swapRouter:", address(swapRouter));
        console.log("saldo do tesouro do CLIENTE (ETH wei):", CLIENT_TREASURY.balance);

        // invariante: a factory nao reteve nada
        console.log("factory ETH balance (deve ser 0):", address(FACTORY).balance);
        console.log("factory token balance (deve ser 0):", NortokenERC20(token).balanceOf(address(FACTORY)));

        vm.stopBroadcast();
    }
}
