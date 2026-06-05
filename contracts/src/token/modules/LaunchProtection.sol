// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @title LaunchProtection
/// @notice Proteções de lançamento TEMPORÁRIAS para o NortokenERC20: anti-snipe,
///         cooldown e anti-whale (maxTx/maxWallet). Todas expiram após uma janela
///         curta (`GUARD_WINDOW`) — depois disso o token fica 100% livre.
/// @dev    O caráter temporário é o que torna o token honeypot-free POR CONSTRUÇÃO:
///         existe um estado final (pós-janela) sem nenhuma restrição. A invariante
///         de sellability é testada nesse estado.
abstract contract LaunchProtection {
    /// Janela máxima em que cooldown e limites anti-whale valem após o trading abrir.
    uint256 public constant GUARD_WINDOW = 1 hours;

    uint64 public tradingEnabledAt; // 0 = trading ainda não habilitado
    uint64 public launchBlock; // bloco em que o trading abriu
    uint64 public antiSnipeBlocks; // nº de blocos pós-launch que bloqueiam não-isentos
    uint64 public tradeCooldownSec; // cooldown por carteira durante a janela
    uint16 public maxWalletBps; // % máx do supply por carteira em bps (0 = off)
    uint16 public maxTxBps; // % máx do supply por transação em bps (0 = off)

    mapping(address => bool) public isExempt; // owner, token, pool, lock: isentos
    mapping(address => uint64) public lastTradeAt;

    error TradingNotEnabled();
    error SnipeBlocked();
    error CooldownActive();
    error MaxTxExceeded();
    error MaxWalletExceeded();

    event TradingEnabled(uint64 launchBlock, uint64 atTime);
    event ExemptSet(address indexed account, bool exempt);

    /// Limites anti-whale + cooldown só valem dentro da janela.
    function limitsActive() public view returns (bool) {
        return tradingEnabledAt != 0 && block.timestamp < tradingEnabledAt + GUARD_WINDOW;
    }

    /// Status legível para o Trust Score / front: o anti-snipe e os limites já caíram?
    function guardStatus()
        external
        view
        returns (bool tradingEnabled, bool snipeActive, bool limitsOn)
    {
        tradingEnabled = tradingEnabledAt != 0;
        snipeActive = tradingEnabled && block.number < launchBlock + antiSnipeBlocks;
        limitsOn = limitsActive();
    }

    /// @dev Chamado no `_update` do token para transferências reais (não mint/burn).
    ///      `toBalanceAfter` = saldo do destinatário já somado ao `amount`.
    function _enforceLaunch(
        address from,
        address to,
        uint256 amount,
        uint256 supply,
        uint256 toBalanceAfter
    ) internal {
        // Isentos (mint inicial, liquidez, owner, pool, lock) nunca são barrados.
        if (isExempt[from] || isExempt[to]) return;

        // 1) Trading precisa estar habilitado (impede sniping antes do lançamento oficial).
        if (tradingEnabledAt == 0) revert TradingNotEnabled();

        // 2) Anti-snipe: bloqueia os bots dos primeiros blocos.
        if (block.number < launchBlock + antiSnipeBlocks) revert SnipeBlocked();

        // 3) Dentro da janela: cooldown + limites anti-whale. Fora dela: nada.
        if (limitsActive()) {
            if (tradeCooldownSec > 0) {
                if (block.timestamp < lastTradeAt[from] + tradeCooldownSec) revert CooldownActive();
                if (block.timestamp < lastTradeAt[to] + tradeCooldownSec) revert CooldownActive();
                lastTradeAt[from] = uint64(block.timestamp);
                lastTradeAt[to] = uint64(block.timestamp);
            }
            if (maxTxBps != 0 && amount > (supply * maxTxBps) / 10_000) revert MaxTxExceeded();
            if (maxWalletBps != 0 && toBalanceAfter > (supply * maxWalletBps) / 10_000) {
                revert MaxWalletExceeded();
            }
        }
    }

    function _enableTrading() internal {
        tradingEnabledAt = uint64(block.timestamp);
        launchBlock = uint64(block.number);
        emit TradingEnabled(launchBlock, tradingEnabledAt);
    }

    function _setExempt(address account, bool exempt) internal {
        isExempt[account] = exempt;
        emit ExemptSet(account, exempt);
    }
}
