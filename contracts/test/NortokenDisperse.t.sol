// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";
import {NortokenDisperse} from "../src/utils/NortokenDisperse.sol";

/// @notice Prova que o NortokenDisperse distribui o supply pra várias carteiras
///         ANTES de habilitar o trading (owner é isento das travas de lançamento).
///         forge test --match-path test/NortokenDisperse.t.sol --fork-url https://sepolia.base.org -vv
contract NortokenDisperseTest is Test {
    NortokenFactory constant FACTORY = NortokenFactory(0xB6BcE4CaCF4285e64de79Bcbf5Aee69cC65c9C78);
    uint256 constant E18 = 1e18;

    function test_DisperseBeforeTrading() public {
        address token = FACTORY.createToken(NortokenERC20.InitParams({
            name: "Disperse Test", symbol: "DTST",
            initialSupply: 1_000_000 * E18, maxCap: 0,
            mintable: true, initialOwner: address(this),
            antiSnipeBlocks: 3, tradeCooldownSec: 30, maxWalletBps: 200, maxTxBps: 100, taxBps: 0, taxTreasury: address(0)
        }));

        NortokenDisperse disperse = new NortokenDisperse();

        address[] memory recipients = new address[](3);
        recipients[0] = address(0xA11CE);
        recipients[1] = address(0xB0B);
        recipients[2] = address(0xCa11);
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 100_000 * E18;
        amounts[1] = 50_000 * E18;
        amounts[2] = 25_000 * E18;

        // Trading NÃO habilitado. Owner aprova o disperse e distribui.
        IERC20(token).approve(address(disperse), type(uint256).max);
        disperse.disperseToken(IERC20(token), recipients, amounts);

        assertEq(IERC20(token).balanceOf(recipients[0]), 100_000 * E18, "A");
        assertEq(IERC20(token).balanceOf(recipients[1]), 50_000 * E18, "B");
        assertEq(IERC20(token).balanceOf(recipients[2]), 25_000 * E18, "C");
        assertEq(IERC20(token).balanceOf(address(this)), (1_000_000 - 175_000) * E18, "owner restante");
        assertEq(IERC20(token).balanceOf(address(disperse)), 0, "disperse nao retem");

        console.log("Disperse OK pre-trading.");
        console.log("  A recebeu:", IERC20(token).balanceOf(recipients[0]) / E18);
        console.log("  B recebeu:", IERC20(token).balanceOf(recipients[1]) / E18);
        console.log("  C recebeu:", IERC20(token).balanceOf(recipients[2]) / E18);
    }

    function test_RevertsOnLengthMismatch() public {
        address token = FACTORY.createToken(NortokenERC20.InitParams({
            name: "Disperse Test2", symbol: "DTS2",
            initialSupply: 1_000 * E18, maxCap: 0,
            mintable: true, initialOwner: address(this),
            antiSnipeBlocks: 0, tradeCooldownSec: 0, maxWalletBps: 0, maxTxBps: 0, taxBps: 0, taxTreasury: address(0)
        }));
        NortokenDisperse disperse = new NortokenDisperse();
        IERC20(token).approve(address(disperse), type(uint256).max);

        address[] memory r = new address[](2);
        uint256[] memory a = new uint256[](1);
        vm.expectRevert(NortokenDisperse.LengthMismatch.selector);
        disperse.disperseToken(IERC20(token), r, a);
    }
}
