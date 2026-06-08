// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";

/// @notice Taxa condicional (fee-on-transfer) do token NÃO-travado:
///         - incide em transferência entre NÃO-isentos (compra/venda/P2P);
///         - isentos (owner, tesouro) não pagam;
///         - venda NUNCA reverte (sellable); sellQuote reflete a taxa;
///         - disableTax() zera (vira limpo); teto duro 5%.
contract NortokenTaxTest is Test {
    address owner = address(this); // também é a "factory" (deployou o token direto)
    address treasury = makeAddr("treasury");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    uint256 constant E18 = 1e18;

    function _mk(uint16 taxBps) internal returns (NortokenERC20 t) {
        t = new NortokenERC20(NortokenERC20.InitParams({
            name: "Tax", symbol: "TAX",
            initialSupply: 1_000_000 * E18, maxCap: 0,
            mintable: false, initialOwner: owner,
            antiSnipeBlocks: 0, tradeCooldownSec: 0, maxWalletBps: 0, maxTxBps: 0,
            taxBps: taxBps, taxTreasury: treasury
        }));
        t.enableTrading(); // libera transferências entre não-isentos
    }

    function test_TaxOnNonExemptTransfer() public {
        NortokenERC20 token = _mk(30); // 0,3%
        token.transfer(alice, 10_000 * E18); // owner isento → sem taxa
        assertEq(token.balanceOf(alice), 10_000 * E18, "owner isento nao taxa");

        vm.prank(alice);
        token.transfer(bob, 1_000 * E18); // alice→bob (não-isentos) → taxa
        uint256 fee = (1_000 * E18 * 30) / 10_000; // 3 tokens
        assertEq(token.balanceOf(bob), 1_000 * E18 - fee, "bob recebe liquido");
        assertEq(token.balanceOf(treasury), fee, "tesouro recebe a taxa");
    }

    function test_SellNeverReverts_and_sellQuote() public {
        NortokenERC20 token = _mk(30);
        token.transfer(alice, 1_000 * E18);
        assertEq(token.sellQuote(1_000 * E18), 1_000 * E18 - 3 * E18, "sellQuote reflete taxa");
        vm.prank(alice);
        token.transfer(bob, 1_000 * E18); // não reverte
    }

    function test_DisableTax_makesClean() public {
        NortokenERC20 token = _mk(30);
        token.disableTax(); // this == factory == owner
        assertEq(token.taxBps(), 0, "taxa zerada");

        token.transfer(alice, 1_000 * E18);
        vm.prank(alice);
        token.transfer(bob, 1_000 * E18);
        assertEq(token.balanceOf(bob), 1_000 * E18, "sem taxa apos disableTax");
        assertEq(token.balanceOf(treasury), 0, "tesouro nao recebe nada");
        assertEq(token.sellQuote(1_000 * E18), 1_000 * E18, "sellQuote limpo");
    }

    function test_TaxCapAt5pct() public {
        vm.expectRevert(NortokenERC20.TaxTooHigh.selector);
        new NortokenERC20(NortokenERC20.InitParams({
            name: "X", symbol: "X", initialSupply: 1, maxCap: 0, mintable: false,
            initialOwner: owner, antiSnipeBlocks: 0, tradeCooldownSec: 0, maxWalletBps: 0, maxTxBps: 0,
            taxBps: 501, taxTreasury: treasury
        }));
    }
}
