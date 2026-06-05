// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";

/// @notice Deploy do NortokenERC20 musculoso em Base Sepolia (Fase 1).
/// Lê a chave da carteira de obra do .env (DEPLOYER_PK) — nunca da linha de comando.
contract DeployToken is Script {
    function run() external returns (NortokenERC20 token) {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address deployer = vm.addr(pk);

        NortokenERC20.InitParams memory p = NortokenERC20.InitParams({
            name: "Nortoken Demo",
            symbol: "NORD",
            initialSupply: 1_000_000 ether,
            maxCap: 0, // sem teto
            mintable: true,
            initialOwner: deployer,
            antiSnipeBlocks: 2,
            tradeCooldownSec: 30,
            maxWalletBps: 200, // 2%
            maxTxBps: 100 // 1%
        });

        vm.startBroadcast(pk);
        token = new NortokenERC20(p);
        vm.stopBroadcast();

        console.log("== NortokenERC20 deployed ==");
        console.log("address:", address(token));
        console.log("owner  :", deployer);
        console.log("supply :", token.totalSupply() / 1e18);
    }
}
