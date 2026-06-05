// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {CurrencySettler} from "v4-core/test/utils/CurrencySettler.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

/// @title NortokenSwapRouter — roteador de swap das pools Nortoken (lado comprador)
/// @notice Faz swaps exact-input numa pool V4 (com o MazariSwapHook) e entrega o output ao
///         comprador. O hook cobra os fees (protocolo + cliente) automaticamente no swap.
///         Suporta âncora ETH nativa (settle por msg.value, sem reter sobra).
/// @dev    Mínimo e auditável: só exact-input + proteção de slippage (minAmountOut).
contract NortokenSwapRouter is IUnlockCallback {
    using CurrencySettler for Currency;
    using BalanceDeltaLibrary for BalanceDelta;

    IPoolManager public immutable poolManager;

    error NotPoolManager();
    error Slippage();
    error EthLeftover();

    constructor(IPoolManager _poolManager) {
        poolManager = _poolManager;
    }

    struct SwapData {
        PoolKey key;
        bool zeroForOne;
        int256 amountSpecified; // negativo = exact-input
        address payer;
        address recipient;
    }

    /// Swap exact-input. Para COMPRA (ETH→token) numa pool ETH/token: zeroForOne=true, envie ETH no value.
    /// Para VENDA (token→ETH): zeroForOne=false, aprove o token a este router antes.
    function swapExactIn(PoolKey calldata key, bool zeroForOne, uint256 amountIn, uint256 minAmountOut)
        external
        payable
        returns (uint256 amountOut)
    {
        BalanceDelta delta = abi.decode(
            poolManager.unlock(abi.encode(SwapData(key, zeroForOne, -int256(amountIn), msg.sender, msg.sender))),
            (BalanceDelta)
        );
        int128 out = zeroForOne ? delta.amount1() : delta.amount0();
        amountOut = out > 0 ? uint256(int256(out)) : 0;
        if (amountOut < minAmountOut) revert Slippage();

        // devolve qualquer ETH não usado ao comprador (âncora ETH manda value cheio)
        if (address(this).balance > 0) {
            (bool ok,) = msg.sender.call{value: address(this).balance}("");
            if (!ok) revert EthLeftover();
        }
    }

    function unlockCallback(bytes calldata raw) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert NotPoolManager();
        SwapData memory d = abi.decode(raw, (SwapData));

        BalanceDelta delta = poolManager.swap(
            d.key,
            IPoolManager.SwapParams({
                zeroForOne: d.zeroForOne,
                amountSpecified: d.amountSpecified,
                sqrtPriceLimitX96: d.zeroForOne ? TickMath.MIN_SQRT_PRICE + 1 : TickMath.MAX_SQRT_PRICE - 1
            }),
            ""
        );

        (Currency inC, Currency outC) =
            d.zeroForOne ? (d.key.currency0, d.key.currency1) : (d.key.currency1, d.key.currency0);
        int128 inAmt = d.zeroForOne ? delta.amount0() : delta.amount1(); // negativo: devemos à pool
        int128 outAmt = d.zeroForOne ? delta.amount1() : delta.amount0(); // positivo: recebemos

        // paga o input (ETH via value deste contrato; ERC20 via transferFrom do payer)
        if (inAmt < 0) inC.settle(poolManager, d.payer, uint256(uint128(-inAmt)), false);
        // entrega o output ao comprador
        if (outAmt > 0) outC.take(poolManager, d.recipient, uint256(uint128(outAmt)), false);

        return abi.encode(delta);
    }

    receive() external payable {}
}
