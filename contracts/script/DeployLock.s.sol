// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {MalleableLiquidityLock} from "../src/lock/MalleableLiquidityLock.sol";

/// @notice Deploy do MalleableLiquidityLock (a "mina") em Base Sepolia.
contract DeployLock is Script {
    IPoolManager constant POOL_MANAGER = IPoolManager(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408);

    function run() external returns (MalleableLiquidityLock lock) {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        vm.startBroadcast(pk);
        lock = new MalleableLiquidityLock(POOL_MANAGER);
        vm.stopBroadcast();
        console.log("== MalleableLiquidityLock deployed ==");
        console.log("address:", address(lock));
    }
}
