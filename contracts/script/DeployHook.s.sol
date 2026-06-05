// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {HookMiner} from "v4-periphery/test/shared/HookMiner.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {MazariSwapHook} from "../src/hook/MazariSwapHook.sol";

/// @notice Deploy do MazariSwapHook em Base Sepolia com ADDRESS MINING (V4 exige que
///         os bits baixos do endereço codifiquem as permissões do hook).
contract DeployHook is Script {
    /// CREATE2 Deployer Proxy canônico (forge roteia `new{salt}` por ele).
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
    /// PoolManager V4 canônico em Base Sepolia (confirmado on-chain).
    IPoolManager constant POOL_MANAGER = IPoolManager(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408);

    function run() external returns (MazariSwapHook hook) {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address treasury = vm.envAddress("PROTOCOL_TREASURY");

        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
                | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        bytes memory constructorArgs = abi.encode(POOL_MANAGER, treasury);

        // Mina o salt cujo endereço CREATE2 tem exatamente os bits dos callbacks.
        (address hookAddr, bytes32 salt) =
            HookMiner.find(CREATE2_DEPLOYER, flags, type(MazariSwapHook).creationCode, constructorArgs);
        console.log("mined hook address:", hookAddr);

        vm.startBroadcast(pk);
        hook = new MazariSwapHook{salt: salt}(POOL_MANAGER, treasury);
        vm.stopBroadcast();

        require(address(hook) == hookAddr, "address mining mismatch");
        console.log("== MazariSwapHook deployed ==");
        console.log("address :", address(hook));
        console.log("treasury:", treasury);
    }
}
