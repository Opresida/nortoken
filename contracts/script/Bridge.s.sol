// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";

/// @notice Bridge ETH da Ethereum Sepolia -> Base Sepolia (mesma carteira no L2) via L1StandardBridge.
///         forge script script/Bridge.s.sol --rpc-url https://ethereum-sepolia-rpc.publicnode.com --broadcast
contract Bridge is Script {
    // Base Sepolia L1StandardBridge (vive na Ethereum Sepolia) — confirmado em docs.base.org
    address constant L1_STANDARD_BRIDGE = 0xfd0Bf71F60660E2f608ed56e1659C450eB113120;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address me = vm.addr(pk);
        uint256 amount = 0.01 ether; // deixa folga p/ gas L1

        vm.startBroadcast(pk);
        // depositETH(uint32 minGasLimit, bytes extraData) -> credita msg.sender no L2 (Base Sepolia)
        (bool ok, ) = L1_STANDARD_BRIDGE.call{value: amount}(
            abi.encodeWithSignature("depositETH(uint32,bytes)", uint32(200_000), bytes(""))
        );
        require(ok, "depositETH falhou");
        vm.stopBroadcast();

        console.log("Bridge enviado:", amount);
        console.log("Para (L2 Base Sepolia):", me);
    }
}
