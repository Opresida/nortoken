// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {HookMiner} from "v4-periphery/test/shared/HookMiner.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {MazariSwapHookV3} from "../src/hook/MazariSwapHookV3.sol";
import {MalleableLiquidityLock} from "../src/lock/MalleableLiquidityLock.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";

/// @notice Deploy do TRIO v3 (linha de montagem completa) em Base Sepolia:
///           1) MazariSwapHookV3 minerado, com OWNER EXPLÍCITO (a carteira de obra) — assim
///              o setAnchor/KYC funcionam (o v2 tinha owner = proxy CREATE2);
///           2) MalleableLiquidityLock fresco (resolve o setFactory one-time);
///           3) NortokenFactory v2 (createPoolAndLock com taxa do cliente);
///           4) wiring: lock.setFactory + hook.setRegistrar(factory) + hook.setAnchor(USDC).
///         Taxa de emissão OFF em testnet (feeEnabled=false).
contract DeployFactory is Script {
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
    IPoolManager constant POOL_MANAGER = IPoolManager(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408);
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    uint256 constant ISSUANCE_FEE = 39e6; // 39 USDC (6 casas) — só cobra quando feeEnabled

    function run()
        external
        returns (MazariSwapHookV3 hook, MalleableLiquidityLock lock, NortokenFactory factory)
    {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address treasury = vm.envAddress("PROTOCOL_TREASURY");
        address keeper = vm.envAddress("KEEPER_ADDR");
        address ownerEoa = vm.addr(pk); // owner explícito = a carteira de obra (não o proxy CREATE2)

        // Mineração: o endereço do hook precisa codificar os bits dos callbacks.
        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
                | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        bytes memory args = abi.encode(POOL_MANAGER, treasury, ownerEoa);
        (address hookAddr, bytes32 salt) =
            HookMiner.find(CREATE2_DEPLOYER, flags, type(MazariSwapHookV3).creationCode, args);
        console.log("mined hook v3:", hookAddr);

        vm.startBroadcast(pk);

        hook = new MazariSwapHookV3{salt: salt}(POOL_MANAGER, treasury, ownerEoa);
        require(address(hook) == hookAddr, "mining mismatch");

        lock = new MalleableLiquidityLock(POOL_MANAGER);
        factory = new NortokenFactory(POOL_MANAGER, hook, lock, USDC, treasury, keeper, ISSUANCE_FEE, false);

        // wiring
        lock.setFactory(address(factory));
        hook.setRegistrar(address(factory)); // factory pode setar a taxa do cliente por pool
        hook.setAnchor(Currency.wrap(USDC), true); // agora funciona (owner é a EOA) → USDC-âncora liberado

        vm.stopBroadcast();

        console.log("== TRIO v3 deployado ==");
        console.log("MazariSwapHookV3         :", address(hook));
        console.log("MalleableLiquidityLock   :", address(lock));
        console.log("NortokenFactory          :", address(factory));
        console.log("owner do hook            :", ownerEoa);
        console.log("keeper (Mazari)          :", keeper);
    }
}
