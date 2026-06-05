// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";
import {MazariSwapHookV3} from "../src/hook/MazariSwapHookV3.sol";
import {NortokenSwapRouter} from "../src/router/NortokenSwapRouter.sol";

/// @notice O lado COMPRADOR: o router executa o swap real, o comprador recebe o token e o
///         hook cobra os dois fees (protocolo + cliente). Slippage é respeitada.
contract NortokenSwapRouterTest is Test, Deployers {
    using CurrencyLibrary for Currency;

    MazariSwapHookV3 internal hook;
    NortokenSwapRouter internal router;
    address internal protocolTreasury = makeAddr("protocolTreasury");
    address internal clientTreasury = makeAddr("clientTreasury");

    function setUp() public {
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
                | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        address hookAddr = address(flags | (uint160(0x6666) << 144));
        deployCodeTo(
            "MazariSwapHookV3.sol:MazariSwapHookV3",
            abi.encode(IPoolManager(address(manager)), protocolTreasury, address(this)),
            hookAddr
        );
        hook = MazariSwapHookV3(hookAddr);
        hook.setAnchor(currency0, true); // currency0 é o âncora

        (key,) = initPoolAndAddLiquidity(currency0, currency1, IHooks(address(hook)), 3000, SQRT_PRICE_1_1);
        hook.setClientFee(key, 200, clientTreasury); // 2% do cliente

        router = new NortokenSwapRouter(manager);
        MockERC20(Currency.unwrap(currency0)).approve(address(router), type(uint256).max);
    }

    /// COMPRA (âncora→token): comprador recebe o token; protocolo e cliente cobram no âncora.
    function test_BuyViaRouter_ReceivesTokenAndChargesFees() public {
        uint256 amountIn = 1e15;
        uint256 tokBefore = currency1.balanceOf(address(this));
        uint256 ptBefore = currency0.balanceOf(protocolTreasury);
        uint256 ctBefore = currency0.balanceOf(clientTreasury);

        uint256 out = router.swapExactIn(key, true, amountIn, 0);

        assertGt(out, 0, "saida > 0");
        assertEq(currency1.balanceOf(address(this)) - tokBefore, out, "comprador recebeu exatamente o output");
        assertEq(currency0.balanceOf(protocolTreasury) - ptBefore, (amountIn * 20) / 10_000, "protocolo 0,2%");
        assertEq(currency0.balanceOf(clientTreasury) - ctBefore, (amountIn * 200) / 10_000, "cliente 2%");
    }

    /// Slippage: minAmountOut acima do real reverte.
    function test_Slippage_Reverts() public {
        vm.expectRevert(NortokenSwapRouter.Slippage.selector);
        router.swapExactIn(key, true, 1e15, type(uint256).max);
    }
}
