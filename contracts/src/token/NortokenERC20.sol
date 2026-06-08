// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {LaunchProtection} from "./modules/LaunchProtection.sol";

/// @title NortokenERC20 — o token "musculoso" do Verso Mazari
/// @notice ERC-20 com proteções de lançamento temporárias e uma TAXA CONDICIONAL:
///         tokens que NÃO travam a liquidez na pool Nortoken nascem com um fee-on-transfer
///         pequeno (capado em 5%) que captura em QUALQUER pool/DEX; ao travar a liquidez,
///         a factory chama `disableTax()` e o token vira 100% limpo (`sellQuote(x)==x`),
///         passando a cobrar o fee só no HOOK V4 (Mazari Swap). Honeypot-free por construção:
///         a taxa é capada e a venda nunca reverte.
/// @dev    Extensões OZ v5: Burnable, Permit (EIP-2612), Ownable2Step, Pausable.
contract NortokenERC20 is ERC20Burnable, ERC20Permit, Ownable2Step, Pausable, LaunchProtection {
    /// Owner pode mintar após o deploy? Vira `false` permanentemente ao renunciar.
    bool public mintable;
    /// Teto máximo de supply (0 = ilimitado).
    uint256 private immutable _cap;

    /// Taxa de transferência (bps) — cobrada de tokens que NÃO travaram a liquidez na pool
    /// Nortoken. Zera PERMANENTEMENTE quando a liquidez é travada (disableTax via factory).
    uint16 public taxBps;
    /// Destino da taxa (tesouro do protocolo Nortoken).
    address public taxTreasury;
    /// Factory que deployou este token — pode zerar a taxa ao travar a liquidez.
    address public immutable factory;
    /// Isenção da TAXA — conjunto SEPARADO e FIXO (owner, token, tesouro). NÃO é o `isExempt`
    /// das travas de lançamento: o owner NÃO pode adicionar isenções de taxa (anti-dodge —
    /// senão o criador isentaria a própria pool externa e fugiria da taxa).
    mapping(address => bool) public taxExempt;

    error MintingDisabled();
    error CapExceeded();
    error CapBelowInitialSupply();
    error TransfersPaused();
    error TaxTooHigh();

    event MintRenounced();
    event TaxDisabled();

    struct InitParams {
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 maxCap; // 0 = sem teto
        bool mintable;
        address initialOwner;
        uint64 antiSnipeBlocks;
        uint64 tradeCooldownSec;
        uint16 maxWalletBps;
        uint16 maxTxBps;
        uint16 taxBps; // 0 = limpo; >0 = fee-on-transfer (a factory injeta o padrão do protocolo)
        address taxTreasury; // destino da taxa
    }

    constructor(InitParams memory p)
        ERC20(p.name, p.symbol)
        ERC20Permit(p.name)
        Ownable(p.initialOwner)
    {
        if (p.maxCap != 0 && p.maxCap < p.initialSupply) revert CapBelowInitialSupply();
        if (p.taxBps > 500) revert TaxTooHigh(); // teto duro 5%
        _cap = p.maxCap;
        mintable = p.mintable;
        antiSnipeBlocks = p.antiSnipeBlocks;
        tradeCooldownSec = p.tradeCooldownSec;
        maxWalletBps = p.maxWalletBps;
        maxTxBps = p.maxTxBps;
        taxBps = p.taxBps;
        taxTreasury = p.taxTreasury;
        factory = msg.sender;

        // Owner e o próprio contrato são isentos das travas (distribuição/liquidez inicial).
        _setExempt(p.initialOwner, true);
        _setExempt(address(this), true);

        // Isenção da TAXA — conjunto fixo: owner (distribui sem se taxar), o token e o tesouro.
        // Qualquer outro (incl. pools externas do criador) PAGA a taxa → não dá pra dodge.
        taxExempt[p.initialOwner] = true;
        taxExempt[address(this)] = true;
        if (p.taxTreasury != address(0)) taxExempt[p.taxTreasury] = true;

        _mint(p.initialOwner, p.initialSupply);
    }

    // ─────────────────────────── Owner controls ───────────────────────────

    /// Mint suplementar (só owner, só se ainda mintável e dentro do cap).
    function mint(address to, uint256 amount) external onlyOwner {
        if (!mintable) revert MintingDisabled();
        if (_cap != 0 && totalSupply() + amount > _cap) revert CapExceeded();
        _mint(to, amount);
    }

    /// Renúncia permanente ao mint — supply fica fixo. Sinal forte de confiança.
    function renounceMint() external onlyOwner {
        mintable = false;
        emit MintRenounced();
    }

    /// Habilita o trading e dispara a janela de proteção de lançamento.
    function enableTrading() external onlyOwner {
        _enableTrading();
    }

    /// Isenta/inclui um endereço das travas (pool V4, lock, roteador). Só owner.
    function setExempt(address account, bool exempt) external onlyOwner {
        _setExempt(account, exempt);
    }

    /// Zera a taxa de transferência PERMANENTEMENTE. Chamada pela factory ao travar a
    /// liquidez na pool Nortoken (ou pelo owner). One-way — o token vira limpo a partir
    /// daqui (só o hook V4 cobra nas swaps da pool). Travou = limpo.
    function disableTax() external {
        if (msg.sender != factory && msg.sender != owner()) revert OwnableUnauthorizedAccount(msg.sender);
        taxBps = 0;
        emit TaxDisabled();
    }

    /// Circuit breaker de emergência. O Trust Score só concede selo com o token despausado.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ─────────────────────── Transparência (views) ───────────────────────

    /// Quanto o destinatário recebe líquido numa transferência não-isenta.
    /// Token travado (taxBps=0) => igual ao input (limpo; o fee 0,2% é só no hook V4).
    /// Token NÃO-travado => desconta a taxa condicional. Nunca reverte (sellable).
    function sellQuote(uint256 amount) external view returns (uint256 netReceived) {
        return amount - (amount * taxBps) / 10_000;
    }

    /// Teto de supply (0 = ilimitado).
    function cap() external view returns (uint256) {
        return _cap;
    }

    // ───────────────────────────── Core hook ─────────────────────────────

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20)
    {
        if (paused()) revert TransfersPaused();
        // Aplica as proteções de lançamento só em transferências reais (não mint/burn).
        if (from != address(0) && to != address(0)) {
            _enforceLaunch(from, to, value, totalSupply(), balanceOf(to) + value);

            // Taxa condicional (fee-on-transfer) — só enquanto o token NÃO travou liquidez
            // (taxBps > 0) e entre não-isentos-de-taxa. Usa `taxExempt` (fixo), NÃO o `isExempt`
            // das travas (que o owner controla) → o criador não consegue isentar a própria pool.
            if (taxBps > 0 && !taxExempt[from] && !taxExempt[to]) {
                uint256 fee = (value * taxBps) / 10_000;
                if (fee > 0) {
                    super._update(from, taxTreasury, fee);
                    super._update(from, to, value - fee);
                    return;
                }
            }
        }
        super._update(from, to, value);
    }
}
