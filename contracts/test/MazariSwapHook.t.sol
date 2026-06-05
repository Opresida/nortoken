// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {MazariSwapHook} from "../src/hook/MazariSwapHook.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";

/// @notice Valida que o fee de 0,2% é capturado SEMPRE no lado-âncora do par
///         (aqui: currency0), nos DOIS sentidos do swap, e NUNCA no token do cliente.
contract MazariSwapHookTest is Test, Deployers {
    using CurrencyLibrary for Currency;

    MazariSwapHook internal hook;
    address internal treasury = makeAddr("treasury");

    function setUp() public {
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
                | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        address hookAddr = address(flags | (uint160(0x4444) << 144));
        deployCodeTo(
            "MazariSwapHook.sol:MazariSwapHook", abi.encode(IPoolManager(address(manager)), treasury), hookAddr
        );
        hook = MazariSwapHook(hookAddr);

        // currency0 é o ÂNCORA (no teste local, ambos são mocks ERC20).
        hook.setAnchor(currency0, true);

        (key,) = initPoolAndAddLiquidity(currency0, currency1, IHooks(address(hook)), 3000, SQRT_PRICE_1_1);
    }

    function test_HookWiredCorrectly() public view {
        assertEq(hook.protocolTreasury(), treasury);
        assertEq(hook.PROTOCOL_FEE_BPS(), 20);
        assertTrue(hook.isAnchor(currency0));
    }

    /// VENDA do token: TOKEN(currency1) -> ÂNCORA(currency0). Fee cobrado no afterSwap, em currency0.
    function test_FeeOnAnchor_Selling() public {
        uint256 before = currency0.balanceOf(treasury);
        swap(key, false, -1e15, ZERO_BYTES); // !zeroForOne, exact-input
        uint256 received = currency0.balanceOf(treasury) - before;
        assertGt(received, 0, "venda: fee deve cair no anchor (currency0)");
        emit log_named_uint("fee no anchor (VENDA) wei", received);
    }

    /// COMPRA do token: ÂNCORA(currency0) -> TOKEN(currency1). Fee cobrado no beforeSwap, em currency0.
    function test_FeeOnAnchor_Buying() public {
        uint256 before = currency0.balanceOf(treasury);
        swap(key, true, -1e15, ZERO_BYTES); // zeroForOne, exact-input
        uint256 received = currency0.balanceOf(treasury) - before;
        assertGt(received, 0, "compra: fee deve cair no anchor (currency0)");
        emit log_named_uint("fee no anchor (COMPRA) wei", received);
    }

    /// O treasury NUNCA recebe o token não-âncora (currency1), em nenhum sentido.
    function test_NeverChargesClientToken() public {
        uint256 c1Before = currency1.balanceOf(treasury);
        swap(key, true, -1e15, ZERO_BYTES); // compra
        swap(key, false, -1e15, ZERO_BYTES); // venda
        assertEq(currency1.balanceOf(treasury), c1Before, "treasury nunca recebe o token volatil do cliente");
    }

    function test_KycBlocksUnattested() public {
        hook.setPermissioned(key, true);
        vm.expectRevert();
        swap(key, true, -1e15, ZERO_BYTES);
    }
}
