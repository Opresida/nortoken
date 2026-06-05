// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseHook} from "./BaseHook.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary, toBeforeSwapDelta} from "v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";

/// @title MazariSwapHook — o "Mazari Swap" do Verso Mazari
/// @notice Hook sobre a Uniswap V4 que captura o fee de protocolo de 0,2% SEMPRE no
///         lado-ÂNCORA do par (ETH/USDC), nunca no token volátil do cliente — pra
///         manter a tesouraria limpa. Cobra nos dois sentidos do swap:
///           • TOKEN → ÂNCORA (venda): cobra do OUTPUT no `afterSwap`.
///           • ÂNCORA → TOKEN (compra): cobra do INPUT no `beforeSwap`.
///         Também faz KYC/atestação opcional para pools de RWA permissionadas.
/// @dev    O fee mora aqui (não no token) → o NortokenERC20 fica limpo/honeypot-free.
///         Otimizado para swaps exact-input (o caso comum); exact-output não é taxado.
contract MazariSwapHook is BaseHook {
    using PoolIdLibrary for PoolKey;
    using BalanceDeltaLibrary for BalanceDelta;

    uint256 public constant PROTOCOL_FEE_BPS = 20; // 0,2%

    address public immutable protocolTreasury;
    address public owner;

    mapping(PoolId => bool) public isPermissioned; // pools RWA exigem atestação
    mapping(address => bool) public attested;
    mapping(Currency => bool) public isAnchor; // ETH(0x0), USDC, ... — onde o fee é capturado

    error NotOwner();
    error NotAttested();

    event SwapTracked(PoolId indexed poolId, address indexed sender, Currency feeCurrency, uint256 feeAmount);
    event PoolPermissioned(PoolId indexed poolId, bool permissioned);
    event AttestationSet(address indexed account, bool value);
    event AnchorSet(Currency indexed currency, bool value);

    constructor(IPoolManager _poolManager, address _protocolTreasury) BaseHook(_poolManager) {
        protocolTreasury = _protocolTreasury;
        owner = msg.sender;
        isAnchor[Currency.wrap(address(0))] = true; // ETH nativo é âncora por padrão
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: true, // cobra fee do INPUT (compra do token)
            afterSwapReturnDelta: true, // cobra fee do OUTPUT (venda do token)
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ─────────────────── config (owner) ───────────────────

    function setAnchor(Currency currency, bool value) external onlyOwner {
        isAnchor[currency] = value;
        emit AnchorSet(currency, value);
    }

    function setPermissioned(PoolKey calldata key, bool permissioned) external onlyOwner {
        isPermissioned[key.toId()] = permissioned;
        emit PoolPermissioned(key.toId(), permissioned);
    }

    function setAttested(address account, bool value) external onlyOwner {
        attested[account] = value;
        emit AttestationSet(account, value);
    }

    // ─────────────────────── hooks ───────────────────────

    /// Cobra o fee no INPUT quando o input é o âncora (compra do token), exact-input.
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
        if (isPermissioned[key.toId()] && !attested[sender]) revert NotAttested();

        bool exactInput = params.amountSpecified < 0;
        if (exactInput) {
            Currency inputCurrency = params.zeroForOne ? key.currency0 : key.currency1;
            if (isAnchor[inputCurrency]) {
                uint256 amountIn = uint256(-params.amountSpecified);
                uint256 fee = (amountIn * PROTOCOL_FEE_BPS) / 10_000;
                if (fee > 0) {
                    // O hook toma `fee` do specified (input); o swap procede com o restante.
                    poolManager.take(inputCurrency, protocolTreasury, fee);
                    emit SwapTracked(key.toId(), sender, inputCurrency, fee);
                    return (IHooks.beforeSwap.selector, toBeforeSwapDelta(int128(int256(fee)), 0), 0);
                }
            }
        }
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /// Cobra o fee no OUTPUT quando o output é o âncora (venda do token).
    function afterSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata
    ) external override onlyPoolManager returns (bytes4, int128) {
        bool zeroForOne = params.zeroForOne;
        Currency outputCurrency = zeroForOne ? key.currency1 : key.currency0;

        // Só cobra se o output é âncora. Se não for, ou já cobramos no beforeSwap
        // (input era âncora), ou a pool não tem âncora — em ambos, nada aqui.
        if (!isAnchor[outputCurrency]) return (IHooks.afterSwap.selector, int128(0));

        int128 outAmount = zeroForOne ? delta.amount1() : delta.amount0();
        if (outAmount <= 0) return (IHooks.afterSwap.selector, int128(0));

        uint256 fee = (uint256(int256(outAmount)) * PROTOCOL_FEE_BPS) / 10_000;
        if (fee == 0) return (IHooks.afterSwap.selector, int128(0));

        poolManager.take(outputCurrency, protocolTreasury, fee);
        emit SwapTracked(key.toId(), sender, outputCurrency, fee);
        return (IHooks.afterSwap.selector, int128(int256(fee)));
    }
}
