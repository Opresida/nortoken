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

/// @title MazariSwapHookV3 — o "Mazari Swap" com taxa do cliente + owner explícito
/// @notice Evolução do v2. Captura SEMPRE no lado-ÂNCORA do par (ETH/USDC), nunca no token
///         volátil do cliente, e agora cobra DOIS fees no mesmo swap:
///           • PROTOCOLO (0,2% fixo) → tesouro da Nortoken;
///           • CLIENTE (configurável por pool, 0–4,8%) → tesouro do projeto do cliente.
///         O total (protocolo + cliente) é limitado a 5% (500 bps) — o mesmo teto da UI.
/// @dev    Duas correções sobre o v2:
///           1) OWNER EXPLÍCITO no construtor — o v2 fazia `owner = msg.sender`, que sob
///              CREATE2 (`new{salt}`) virava o proxy 0x4e59…, deixando setAnchor/KYC
///              inalcançáveis. Aqui o owner é passado e sobrevive ao deploy determinístico.
///           2) TAXA POR-POOL do cliente, setada por um REGISTRAR autorizado (a factory)
///              no momento da criação da pool.
contract MazariSwapHookV3 is BaseHook {
    using PoolIdLibrary for PoolKey;
    using BalanceDeltaLibrary for BalanceDelta;

    uint16 public constant PROTOCOL_FEE_BPS = 20; // 0,2% fixo da Nortoken
    uint16 public constant MAX_TOTAL_FEE_BPS = 500; // teto duro 5% (espelha o front)

    address public immutable protocolTreasury;
    address public owner;
    address public registrar; // a NortokenFactory autorizada a setar a taxa de cada pool

    struct ClientFee {
        uint16 bps; // taxa do cliente em bps (protocolo + cliente <= 500)
        address treasury; // tesouro do projeto do cliente
    }

    mapping(PoolId => bool) public isPermissioned; // pools RWA exigem atestação
    mapping(address => bool) public attested;
    mapping(Currency => bool) public isAnchor; // ETH(0x0), USDC, ... — onde o fee é capturado
    mapping(PoolId => ClientFee) public clientFee; // taxa do cliente por pool

    error NotOwner();
    error NotRegistrar();
    error NotAttested();
    error FeeAboveCap();
    error TreasuryRequired();

    event SwapTracked(PoolId indexed poolId, address indexed sender, Currency feeCurrency, uint256 protocolFee, uint256 clientFee);
    event PoolPermissioned(PoolId indexed poolId, bool permissioned);
    event AttestationSet(address indexed account, bool value);
    event AnchorSet(Currency indexed currency, bool value);
    event RegistrarSet(address indexed registrar);
    event ClientFeeSet(PoolId indexed poolId, uint16 bps, address treasury);

    constructor(IPoolManager _poolManager, address _protocolTreasury, address _owner) BaseHook(_poolManager) {
        protocolTreasury = _protocolTreasury;
        owner = _owner; // EXPLÍCITO — não msg.sender; sobrevive ao CREATE2
        isAnchor[Currency.wrap(address(0))] = true; // ETH nativo é âncora por padrão
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// Registrar (factory) OU owner — quem pode setar a taxa de cada pool.
    modifier onlyRegistrarOrOwner() {
        if (msg.sender != registrar && msg.sender != owner) revert NotRegistrar();
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

    // ─────────────────── config (owner / registrar) ───────────────────

    function setAnchor(Currency currency, bool value) external onlyOwner {
        isAnchor[currency] = value;
        emit AnchorSet(currency, value);
    }

    function setRegistrar(address r) external onlyOwner {
        registrar = r;
        emit RegistrarSet(r);
    }

    /// Define a taxa do cliente para uma pool. Chamada pela factory ao criar a pool.
    /// Valida o teto: protocolo (20) + cliente <= 500 bps; tesouro obrigatório se houver taxa.
    function setClientFee(PoolKey calldata key, uint16 bps, address treasury) external onlyRegistrarOrOwner {
        if (uint256(PROTOCOL_FEE_BPS) + bps > MAX_TOTAL_FEE_BPS) revert FeeAboveCap();
        if (bps > 0 && treasury == address(0)) revert TreasuryRequired();
        clientFee[key.toId()] = ClientFee(bps, treasury);
        emit ClientFeeSet(key.toId(), bps, treasury);
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

    /// Cobra protocolo + cliente no INPUT quando o input é o âncora (compra), exact-input.
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
                uint256 total = _collect(key.toId(), inputCurrency, amountIn, sender);
                if (total > 0) {
                    // O hook toma `total` do specified (input); o swap procede com o restante.
                    return (IHooks.beforeSwap.selector, toBeforeSwapDelta(int128(int256(total)), 0), 0);
                }
            }
        }
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /// Cobra protocolo + cliente no OUTPUT quando o output é o âncora (venda).
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

        uint256 total = _collect(key.toId(), outputCurrency, uint256(int256(outAmount)), sender);
        return (IHooks.afterSwap.selector, int128(int256(total)));
    }

    /// Calcula e retira os DOIS fees (protocolo + cliente) na moeda-âncora.
    /// Retorna o total retirado — o caller usa esse total como delta de accounting.
    function _collect(PoolId poolId, Currency anchor, uint256 amount, address sender)
        internal
        returns (uint256 total)
    {
        uint256 protoFee = (amount * PROTOCOL_FEE_BPS) / 10_000;
        ClientFee memory cf = clientFee[poolId];
        uint256 cliFee = cf.bps == 0 ? 0 : (amount * cf.bps) / 10_000;

        if (protoFee > 0) poolManager.take(anchor, protocolTreasury, protoFee);
        if (cliFee > 0) poolManager.take(anchor, cf.treasury, cliFee);

        total = protoFee + cliFee;
        if (total > 0) emit SwapTracked(poolId, sender, anchor, protoFee, cliFee);
    }
}
