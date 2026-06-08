// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";

/// @notice Prova on-chain a TAXA EM AÇÃO: owner (isento) passa tokens pro walletA; walletA
///         (não-isento) transfere pro walletB → 0,3% cai no tesouro. Dois broadcasts (owner + walletA).
contract TestTaxTransfer is Script {
    address constant TOKEN = 0x746510ea9440f40e649266806196094e624Dffc6;
    address constant WALLET_A = 0x1fcbB8a83c1E2B95eB071eEB911F33b90Ce27A11;
    address constant WALLET_B = 0xFa65bC5710Ea92216b5b69c737B94a756A63658d;
    uint256 constant E18 = 1e18;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        uint256 pkA = vm.envUint("WALLET_A_PK");
        NortokenERC20 t = NortokenERC20(TOKEN);
        address tre = t.taxTreasury();

        // owner (isento) prepara: habilita trading, dá tokens pro walletA, financia o gás dele
        vm.startBroadcast(pk);
        t.enableTrading();
        t.transfer(WALLET_A, 10_000 * E18); // owner isento → SEM taxa
        (bool ok,) = WALLET_A.call{value: 0.0004 ether}("");
        require(ok, "fund A failed");
        vm.stopBroadcast();

        uint256 treBefore = t.balanceOf(tre);

        // walletA (NÃO isento) → walletB: deve cobrar 0,3%
        vm.startBroadcast(pkA);
        t.transfer(WALLET_B, 1_000 * E18);
        vm.stopBroadcast();

        console.log("walletA->walletB de 1000 tokens:");
        console.log("  walletB recebeu (esperado 997):", t.balanceOf(WALLET_B) / E18);
        console.log("  taxa pro tesouro (esperado 3) :", (t.balanceOf(tre) - treBefore) / E18);
    }
}
