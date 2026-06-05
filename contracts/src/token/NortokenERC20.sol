// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {LaunchProtection} from "./modules/LaunchProtection.sol";

/// @title NortokenERC20 — o token "musculoso" do Verso Mazari
/// @notice ERC-20 limpo (SEM fee-on-transfer) com proteções de lançamento temporárias.
///         O fee de protocolo (0,2%) e a taxa do projeto são capturados NO HOOK V4
///         (Mazari Swap), não aqui — por isso o token é honeypot-free por construção:
///         `sellQuote(x) == x` e, após a janela de lançamento, nenhuma transferência
///         legítima pode reverter.
/// @dev    Extensões OZ v5: Burnable, Permit (EIP-2612), Ownable2Step, Pausable.
contract NortokenERC20 is ERC20Burnable, ERC20Permit, Ownable2Step, Pausable, LaunchProtection {
    /// Owner pode mintar após o deploy? Vira `false` permanentemente ao renunciar.
    bool public mintable;
    /// Teto máximo de supply (0 = ilimitado).
    uint256 private immutable _cap;

    error MintingDisabled();
    error CapExceeded();
    error CapBelowInitialSupply();
    error TransfersPaused();

    event MintRenounced();

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
    }

    constructor(InitParams memory p)
        ERC20(p.name, p.symbol)
        ERC20Permit(p.name)
        Ownable(p.initialOwner)
    {
        if (p.maxCap != 0 && p.maxCap < p.initialSupply) revert CapBelowInitialSupply();
        _cap = p.maxCap;
        mintable = p.mintable;
        antiSnipeBlocks = p.antiSnipeBlocks;
        tradeCooldownSec = p.tradeCooldownSec;
        maxWalletBps = p.maxWalletBps;
        maxTxBps = p.maxTxBps;

        // Owner e o próprio contrato são isentos das travas (distribuição/liquidez inicial).
        _setExempt(p.initialOwner, true);
        _setExempt(address(this), true);

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

    /// Circuit breaker de emergência. O Trust Score só concede selo com o token despausado.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ─────────────────────── Transparência (views) ───────────────────────

    /// Quanto o vendedor recebe líquido numa venda do token. Sem fee no token => igual ao input.
    /// O fee de swap (0,2% protocolo + taxa do projeto) é cobrado no hook V4, não aqui.
    function sellQuote(uint256 amount) external pure returns (uint256 netReceived) {
        return amount;
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
        }
        super._update(from, to, value);
    }
}
