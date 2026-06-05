// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IUnlockCallback} from "v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {CurrencySettler} from "v4-core/test/utils/CurrencySettler.sol";

/// @title MalleableLiquidityLock — o "lock maleável" do Verso Mazari (a mina)
/// @notice Trava a liquidez de uma pool V4 com DUAS camadas:
///           • PRINCIPAL TRAVADO  → ninguém (nem dono, nem keeper) saca antes do unlock.
///           • RANGE AJUSTÁVEL     → um keeper de permissão restrita reposiciona o range
///             (decrease+re-add atômico), mas NUNCA envia tokens pra fora do cofre.
/// @dev    Esse desenho é o que permite a Mazari Fi otimizar a liquidez travada sem
///         custodiar nada — e é defensivo por construção no ponto regulatório do keeper:
///         a função `rebalance` não tem destino nem valor de saque; só ticks.
contract MalleableLiquidityLock is IUnlockCallback {
    using CurrencySettler for Currency;
    using BalanceDeltaLibrary for BalanceDelta;

    IPoolManager public immutable poolManager;
    address public immutable deployer; // quem deployou; autoriza a factory 1x
    address public factory; // única que pode chamar depositPrincipalFor (orquestração)

    struct Lock {
        PoolKey key;
        address projectOwner; // recebe o principal de volta no unlock
        uint128 principalLiquidity; // liquidez travada (piso inviolável)
        int24 tickLower; // range atual
        int24 tickUpper;
        int24 minTick; // bounds que o keeper pode usar
        int24 maxTick;
        uint64 unlockTime; // principal só sai depois disto
        address keeper; // único que pode reposicionar o range
        bool active;
    }

    uint256 public nextLockId;
    mapping(uint256 => Lock) public locks;

    enum Action {
        DEPOSIT,
        WITHDRAW,
        REBALANCE
    }

    struct CallbackData {
        Action action;
        uint256 lockId;
        address payer;
        int24 newLower;
        int24 newUpper;
        uint128 liquidity;
    }

    error NotProjectOwner();
    error NotKeeper();
    error StillLocked();
    error RangeOutOfBounds();
    error PrincipalShrunk();
    error NotPoolManager();
    error Inactive();
    error NotDeployer();
    error NotFactory();
    error FactoryAlreadySet();
    error RefundFailed();

    event PrincipalLocked(uint256 indexed lockId, address indexed projectOwner, uint128 liquidity, uint64 unlockTime);
    event Rebalanced(uint256 indexed lockId, int24 newLower, int24 newUpper);
    event PrincipalWithdrawn(uint256 indexed lockId, address indexed to);
    event FactorySet(address indexed factory);

    constructor(IPoolManager _poolManager) {
        poolManager = _poolManager;
        deployer = msg.sender;
    }

    modifier onlyFactory() {
        if (msg.sender != factory) revert NotFactory();
        _;
    }

    /// Autoriza a NortokenFactory a orquestrar depósitos (1x, só o deployer).
    function setFactory(address f) external {
        if (msg.sender != deployer) revert NotDeployer();
        if (factory != address(0)) revert FactoryAlreadySet();
        factory = f;
        emit FactorySet(f);
    }

    // ─────────────────────── ações públicas ───────────────────────

    /// Cria o lock: trava `liquidity` num range, com prazo e keeper restrito.
    /// O `msg.sender` (projectOwner) deve ter aprovado os 2 tokens a este contrato.
    /// Versão direta (sem âncora ETH nativa): dono e pagador são o `msg.sender`.
    function depositPrincipal(
        PoolKey calldata key,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        int24 minTick,
        int24 maxTick,
        uint64 lockDuration,
        address keeper
    ) external returns (uint256 lockId) {
        return _deposit(msg.sender, msg.sender, key, tickLower, tickUpper, liquidity, minTick, maxTick, lockDuration, keeper);
    }

    /// Versão orquestrada pela NortokenFactory: separa o DONO do principal (recupera no
    /// unlock) de quem PAGA os tokens (settle via transferFrom). É `payable` para suportar
    /// pools com âncora ETH nativa — o `CurrencySettler.settle` de ETH gasta o saldo DESTE
    /// contrato (ignora o payer), então a factory repassa `msg.value` e a sobra é devolvida
    /// ao projectOwner. A factory nunca retém fundos.
    function depositPrincipalFor(
        address projectOwner,
        address payer,
        PoolKey calldata key,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        int24 minTick,
        int24 maxTick,
        uint64 lockDuration,
        address keeper
    ) external payable onlyFactory returns (uint256 lockId) {
        // saldo de ETH que já existia antes desta chamada (esperado: 0 — o cofre não acumula ETH)
        uint256 ethFloor = address(this).balance - msg.value;

        lockId = _deposit(projectOwner, payer, key, tickLower, tickUpper, liquidity, minTick, maxTick, lockDuration, keeper);

        // Âncora ETH: o cliente costuma mandar value a mais (o delta exato só se conhece no
        // modifyLiquidity). Devolve a sobra ao dono — nada de ETH fica preso no cofre.
        uint256 leftover = address(this).balance - ethFloor;
        if (leftover > 0) {
            (bool ok,) = projectOwner.call{value: leftover}("");
            if (!ok) revert RefundFailed();
        }
    }

    function _deposit(
        address projectOwner,
        address payer,
        PoolKey calldata key,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        int24 minTick,
        int24 maxTick,
        uint64 lockDuration,
        address keeper
    ) internal returns (uint256 lockId) {
        lockId = nextLockId++;
        locks[lockId] = Lock({
            key: key,
            projectOwner: projectOwner,
            principalLiquidity: liquidity,
            tickLower: tickLower,
            tickUpper: tickUpper,
            minTick: minTick,
            maxTick: maxTick,
            unlockTime: uint64(block.timestamp) + lockDuration,
            keeper: keeper,
            active: true
        });

        poolManager.unlock(
            abi.encode(CallbackData(Action.DEPOSIT, lockId, payer, tickLower, tickUpper, liquidity))
        );

        emit PrincipalLocked(lockId, projectOwner, liquidity, locks[lockId].unlockTime);
    }

    /// Reposiciona SÓ o range (keeper). Não saca nada: tokens nunca deixam o cofre.
    function rebalance(uint256 lockId, int24 newLower, int24 newUpper) external {
        Lock storage l = locks[lockId];
        if (!l.active) revert Inactive();
        if (msg.sender != l.keeper) revert NotKeeper();
        if (newLower < l.minTick || newUpper > l.maxTick || newLower >= newUpper) revert RangeOutOfBounds();

        poolManager.unlock(abi.encode(CallbackData(Action.REBALANCE, lockId, address(this), newLower, newUpper, 0)));

        l.tickLower = newLower;
        l.tickUpper = newUpper;
        emit Rebalanced(lockId, newLower, newUpper);
    }

    /// Devolve o principal ao dono — só após o unlock. Antes disso: revert sempre.
    function withdrawPrincipal(uint256 lockId) external {
        Lock storage l = locks[lockId];
        if (!l.active) revert Inactive();
        if (msg.sender != l.projectOwner) revert NotProjectOwner();
        if (block.timestamp < l.unlockTime) revert StillLocked();

        poolManager.unlock(abi.encode(CallbackData(Action.WITHDRAW, lockId, l.projectOwner, 0, 0, 0)));

        l.active = false;
        emit PrincipalWithdrawn(lockId, l.projectOwner);
    }

    // ─────────────────────── callback do V4 ───────────────────────

    function unlockCallback(bytes calldata raw) external returns (bytes memory) {
        if (msg.sender != address(poolManager)) revert NotPoolManager();
        CallbackData memory d = abi.decode(raw, (CallbackData));
        Lock storage l = locks[d.lockId];

        if (d.action == Action.DEPOSIT) {
            // adiciona liquidez; o lock paga com os tokens do projectOwner (settle)
            _modify(l.key, d.newLower, d.newUpper, int256(uint256(d.liquidity)), d.payer);
        } else if (d.action == Action.WITHDRAW) {
            // remove TODA a liquidez e manda ao projectOwner (take)
            _modify(l.key, l.tickLower, l.tickUpper, -int256(uint256(l.principalLiquidity)), d.payer);
        } else {
            // REBALANCE: remove do range atual (take p/ o cofre) e re-add no novo range
            // (settle do cofre). recipient/payer = address(this) => nada sai pro keeper.
            uint128 principal = l.principalLiquidity;
            _modify(l.key, l.tickLower, l.tickUpper, -int256(uint256(principal)), address(this));
            _modify(l.key, d.newLower, d.newUpper, int256(uint256(principal)), address(this));
            // invariante: a liquidez re-adicionada é exatamente o principal — nunca menor.
            // (qualquer fee/sobra coletada fica no cofre, jamais vai ao keeper)
        }
        return "";
    }

    /// Executa modifyLiquidity e resolve os deltas: paga (settle) o que deve, recebe (take) o que sobra.
    function _modify(PoolKey memory key, int24 lower, int24 upper, int256 liqDelta, address counterparty) internal {
        (BalanceDelta delta,) = poolManager.modifyLiquidity(
            key,
            IPoolManager.ModifyLiquidityParams({tickLower: lower, tickUpper: upper, liquidityDelta: liqDelta, salt: 0}),
            ""
        );

        int128 a0 = delta.amount0();
        int128 a1 = delta.amount1();

        // negativo => o cofre deve à pool: paga via settle (com tokens do counterparty)
        if (a0 < 0) key.currency0.settle(poolManager, counterparty, uint256(uint128(-a0)), false);
        if (a1 < 0) key.currency1.settle(poolManager, counterparty, uint256(uint128(-a1)), false);
        // positivo => a pool deve ao cofre: recebe via take (para o counterparty)
        if (a0 > 0) key.currency0.take(poolManager, counterparty, uint256(uint128(a0)), false);
        if (a1 > 0) key.currency1.take(poolManager, counterparty, uint256(uint128(a1)), false);
    }
}
