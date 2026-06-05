// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {PoolModifyLiquidityTest} from "v4-core/src/test/PoolModifyLiquidityTest.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Cria a pool NORD/ETH com o MazariSwapHook, adiciona liquidez e dispara
///         um swap real em Base Sepolia. O hook captura 0,2% e emite SwapTracked.
contract CreatePoolAndSwap is Script {
    IPoolManager constant MANAGER = IPoolManager(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408);
    address constant NORD = 0xFA5e8D8029CB6F5fae62099722D483598423d575;
    address constant HOOK = 0x140e8E79d9C1AE3D87612748AE24Cca62a2480C4;
    uint160 constant SQRT_PRICE_1_1 = 79228162514264337593543950336;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");

        vm.startBroadcast(pk);

        PoolModifyLiquidityTest lpRouter = new PoolModifyLiquidityTest(MANAGER);
        PoolSwapTest swapRouter = new PoolSwapTest(MANAGER);

        // ETH nativo (0x0) = currency0; NORD = currency1
        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(address(0)),
            currency1: Currency.wrap(NORD),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(HOOK)
        });

        IERC20(NORD).approve(address(lpRouter), type(uint256).max);
        IERC20(NORD).approve(address(swapRouter), type(uint256).max);

        MANAGER.initialize(key, SQRT_PRICE_1_1);

        // Liquidez (range amplo; ETH entra via value, NORD via approve)
        IPoolManager.ModifyLiquidityParams memory liqParams =
            IPoolManager.ModifyLiquidityParams({tickLower: -6000, tickUpper: 6000, liquidityDelta: 1e17, salt: 0});
        lpRouter.modifyLiquidity{value: 0.04 ether}(key, liqParams, "");

        // Swap real: ETH -> NORD, exact input 0,002 ETH. O hook captura 0,2% do output.
        IPoolManager.SwapParams memory sp = IPoolManager.SwapParams({
            zeroForOne: true,
            amountSpecified: -0.002 ether,
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        });
        swapRouter.swap{value: 0.002 ether}(
            key, sp, PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}), ""
        );

        vm.stopBroadcast();

        console.log("== pool NORD/ETH criada + swap executado ==");
        console.log("lpRouter  :", address(lpRouter));
        console.log("swapRouter:", address(swapRouter));
        console.log("hook      :", HOOK);
    }
}
