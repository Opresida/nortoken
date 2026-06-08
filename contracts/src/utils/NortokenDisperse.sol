// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title NortokenDisperse — distribui um ERC20 para várias carteiras em UMA tx.
/// @notice O chamador (owner do token recém-criado) aprova este contrato e chama
///         `disperseToken`. Os tokens saem do `msg.sender` via `transferFrom` direto
///         para cada destinatário — o contrato nunca retém saldo.
/// @dev    Como o `from` é o owner do token (isento das travas de lançamento do
///         NortokenERC20), a distribuição passa mesmo ANTES de habilitar o trading.
contract NortokenDisperse {
    error NoRecipients();
    error LengthMismatch();
    error TransferFailed();

    event Dispersed(address indexed token, address indexed from, uint256 total, uint256 count);

    /// @param token       ERC20 a distribuir (o owner já deu approve neste contrato).
    /// @param recipients  carteiras de destino.
    /// @param amounts     quantidade (em wei do token) para cada carteira; mesmo length.
    function disperseToken(
        IERC20 token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        uint256 n = recipients.length;
        if (n == 0) revert NoRecipients();
        if (n != amounts.length) revert LengthMismatch();

        uint256 total;
        for (uint256 i; i < n; ++i) {
            if (!token.transferFrom(msg.sender, recipients[i], amounts[i])) revert TransferFailed();
            total += amounts[i];
        }

        emit Dispersed(address(token), msg.sender, total, n);
    }
}
