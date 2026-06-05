// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {NortokenERC20} from "../token/NortokenERC20.sol";
import {MazariSwapHookV3} from "../hook/MazariSwapHookV3.sol";
import {MalleableLiquidityLock} from "../lock/MalleableLiquidityLock.sol";

/// @title NortokenFactory — a "linha de montagem" do Verso Mazari
/// @notice Transforma as 3 peças soltas (token musculoso + hook de fee + lock maleável)
///         num fluxo de produto em DOIS PASSOS SEPARADOS, por escolha de produto:
///           1) `createToken`        — cria o token standalone (o cliente pode mostrar a
///              um investidor ANTES de ter pool);
///           2) `createPoolAndLock`  — "Crie sua pool": inicializa a pool V4 com o hook e
///              TRANCA a liquidez no lock maleável (keeper = Mazari). O cliente ganha um
///              passivo gerenciado pela Fi, acompanhável depois na Mazari Wallet.
/// @dev    A factory NUNCA custodia fundos: no passo 2 os tokens vão direto do cliente
///         para a pool (o lock faz o settle puxando do próprio cliente) e o ETH é apenas
///         repassado no mesmo call. Os dados do passivo ficam expostos on-chain
///         (eventos + views) para a API/Wallet plugarem depois.
contract NortokenFactory {
    // ─────────────────────────── infraestrutura (imutável) ───────────────────────────
    IPoolManager public immutable poolManager;
    MazariSwapHookV3 public immutable hook;
    MalleableLiquidityLock public immutable lock;
    address public immutable usdc; // moeda da taxa de emissão (USDC-only, sem fiat)
    address public immutable treasury; // recebe a taxa de emissão
    address public immutable mazariKeeper; // keeper de TODOS os locks → o passivo gerenciado

    // ─────────────────────────── governança da taxa ───────────────────────────
    address public owner;
    bool public feeEnabled; // OFF em testnet; liga em mainnet
    uint256 public issuanceFee; // em unidades do USDC (6 casas → 39e6 = 39 USDC)

    // ─────────────────────────── registro on-chain (o passivo) ───────────────────────────
    struct PoolPosition {
        PoolKey key;
        uint256 lockId;
        address lock;
        address keeper;
    }

    mapping(address => bool) public isNortoken; // token saiu desta factory?
    mapping(address => address) public tokenCreator; // token → criador
    mapping(address => address[]) private _creatorTokens; // criador → tokens dele
    mapping(address => PoolPosition) private _poolPositions; // token → posição travada
    mapping(address => uint256[]) private _clientLocks; // cliente → lockIds (passivos)

    // ─────────────────────────── erros & eventos ───────────────────────────
    error NotOwner();
    error NotNortoken();
    error NotTokenCreator();
    error AnchorNotRegistered();
    error LockNotExempt();
    error PoolAlreadyRegistered();

    event TokenCreated(
        address indexed creator, address indexed token, string name, string symbol, uint256 initialSupply
    );
    event PoolAndLockCreated(
        address indexed creator, address indexed token, uint256 indexed lockId, address lock, address keeper, uint24 fee
    );
    event IssuanceFeeCharged(address indexed payer, uint256 amount);
    event FeeConfigUpdated(bool enabled, uint256 fee);

    constructor(
        IPoolManager _poolManager,
        MazariSwapHookV3 _hook,
        MalleableLiquidityLock _lock,
        address _usdc,
        address _treasury,
        address _mazariKeeper,
        uint256 _issuanceFee,
        bool _feeEnabled
    ) {
        poolManager = _poolManager;
        hook = _hook;
        lock = _lock;
        usdc = _usdc;
        treasury = _treasury;
        mazariKeeper = _mazariKeeper;
        issuanceFee = _issuanceFee;
        feeEnabled = _feeEnabled;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ═══════════════════════════ PASSO 1 — criar o token ═══════════════════════════

    /// Cria um NortokenERC20 padrão. O cliente (msg.sender) vira owner e recebe o supply.
    /// Cobra a taxa de emissão em USDC quando `feeEnabled` (OFF em testnet). Registra o
    /// token para o marketplace/dashboard listarem depois. NÃO cria pool — isso é o passo 2.
    function createToken(NortokenERC20.InitParams calldata params) external returns (address token) {
        if (feeEnabled && issuanceFee > 0) {
            // cobra direto do cliente para o tesouro — a factory não retém nada
            require(IERC20(usdc).transferFrom(msg.sender, treasury, issuanceFee), "fee transfer failed");
            emit IssuanceFeeCharged(msg.sender, issuanceFee);
        }

        NortokenERC20.InitParams memory p = params;
        p.initialOwner = msg.sender; // força o cliente como owner (sem spoofing do campo)
        token = address(new NortokenERC20(p));

        isNortoken[token] = true;
        tokenCreator[token] = msg.sender;
        _creatorTokens[msg.sender].push(token);

        emit TokenCreated(msg.sender, token, p.name, p.symbol, p.initialSupply);
    }

    // ═══════════════════════════ PASSO 2 — "Crie sua pool" ═══════════════════════════

    struct LockParams {
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        int24 minTick; // bounds que o keeper (Mazari) pode usar ao reposicionar
        int24 maxTick;
        uint64 lockDuration;
    }

    /// Para um token JÁ criado: inicializa a pool V4 com o MazariSwapHook e tranca a
    /// liquidez do cliente no lock maleável com keeper = Mazari. O principal fica travado
    /// (anti-rug) e a Fi otimiza o range → o cliente ganha um passivo gerenciado.
    ///
    /// Pré-condições (o cliente faz uma vez, são `onlyOwner` DELE no token):
    ///   • `token.setExempt(address(lock), true)` — para o rebalance do keeper não bater
    ///     nas travas de lançamento (mecanicamente obrigatório);
    ///   • aprovar O LOCK (não a factory) para o token e, se âncora USDC, para o USDC;
    ///   • se âncora ETH, enviar o ETH como `msg.value` (a sobra é devolvida).
    /// `enableTrading()` é um passo à parte do cliente (abrir ao público) e não é exigido aqui.
    function createPoolAndLock(
        address token,
        Currency anchor,
        uint24 fee,
        int24 tickSpacing,
        uint160 sqrtPriceX96,
        LockParams calldata lp,
        uint16 clientFeeBps,
        address clientTreasury
    ) external payable returns (PoolKey memory key, uint256 lockId) {
        if (!isNortoken[token]) revert NotNortoken();
        if (msg.sender != tokenCreator[token]) revert NotTokenCreator();
        if (!hook.isAnchor(anchor)) revert AnchorNotRegistered();
        if (!NortokenERC20(token).isExempt(address(lock))) revert LockNotExempt();
        if (_poolPositions[token].lock != address(0)) revert PoolAlreadyRegistered();

        key = _buildKey(token, anchor, fee, tickSpacing);
        poolManager.initialize(key, sqrtPriceX96);

        // Taxa do projeto do cliente (0 = só os 0,2% do protocolo). A factory é o registrar.
        if (clientFeeBps > 0) hook.setClientFee(key, clientFeeBps, clientTreasury);

        // Cliente é dono do principal E pagador (aprova o lock). ETH (se houver) é repassado.
        lockId = _lockFor(key, lp);

        _poolPositions[token] = PoolPosition({key: key, lockId: lockId, lock: address(lock), keeper: mazariKeeper});
        _clientLocks[msg.sender].push(lockId);

        emit PoolAndLockCreated(msg.sender, token, lockId, address(lock), mazariKeeper, fee);
    }

    /// Monta a PoolKey ordenando as currencies (V4 exige currency0 < currency1).
    function _buildKey(address token, Currency anchor, uint24 fee, int24 tickSpacing)
        internal
        view
        returns (PoolKey memory)
    {
        Currency tokenC = Currency.wrap(token);
        (Currency c0, Currency c1) = Currency.unwrap(anchor) < token ? (anchor, tokenC) : (tokenC, anchor);
        return PoolKey({currency0: c0, currency1: c1, fee: fee, tickSpacing: tickSpacing, hooks: IHooks(address(hook))});
    }

    /// Tranca a liquidez do cliente no lock maleável (keeper = Mazari). Isolado para
    /// manter a pilha rasa no orquestrador (muitos parâmetros no call do lock).
    function _lockFor(PoolKey memory key, LockParams calldata lp) internal returns (uint256) {
        return lock.depositPrincipalFor{value: msg.value}(
            msg.sender, // projectOwner: recupera o principal no unlock
            msg.sender, // payer: o settle puxa os tokens dele
            key,
            lp.tickLower,
            lp.tickUpper,
            lp.liquidity,
            lp.minTick,
            lp.maxTick,
            lp.lockDuration,
            mazariKeeper // keeper = Mazari → passivo gerenciado pela Fi
        );
    }

    // ═══════════════════════════ views (para a API/Wallet) ═══════════════════════════

    function getCreatorTokens(address creator) external view returns (address[] memory) {
        return _creatorTokens[creator];
    }

    function getClientLocks(address client) external view returns (uint256[] memory) {
        return _clientLocks[client];
    }

    function getPoolPosition(address token) external view returns (PoolPosition memory) {
        return _poolPositions[token];
    }

    // ═══════════════════════════ governança da taxa ═══════════════════════════

    /// Liga a cobrança em mainnet (mantida OFF em testnet) e/ou ajusta o valor.
    function setFeeConfig(bool _feeEnabled, uint256 _issuanceFee) external onlyOwner {
        feeEnabled = _feeEnabled;
        issuanceFee = _issuanceFee;
        emit FeeConfigUpdated(_feeEnabled, _issuanceFee);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
