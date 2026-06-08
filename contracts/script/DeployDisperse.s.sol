// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {NortokenDisperse} from "../src/utils/NortokenDisperse.sol";

/// @notice Deploya o NortokenDisperse na Base Sepolia.
///         forge script script/DeployDisperse.s.sol --rpc-url https://sepolia.base.org --broadcast
contract DeployDisperse is Script {
    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        vm.startBroadcast(pk);
        NortokenDisperse disperse = new NortokenDisperse();
        vm.stopBroadcast();
        console.log("NortokenDisperse:", address(disperse));
    }
}
