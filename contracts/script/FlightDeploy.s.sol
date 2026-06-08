// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";

/// @notice TESTE DE VOO (broadcast REAL) — cria 3 tokens persistentes na Base Sepolia, um por
///         nivel de confiabilidade, via a FACTORY real. Tokens ficam no BaseScan p/ checagem manual.
///         forge script script/FlightDeploy.s.sol --rpc-url base_sepolia --broadcast
contract FlightDeploy is Script {
    NortokenFactory constant FACTORY = NortokenFactory(0xB6BcE4CaCF4285e64de79Bcbf5Aee69cC65c9C78);
    uint256 constant E18 = 1e18;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address deployer = vm.addr(pk);
        vm.startBroadcast(pk);

        // Perfil A — CONFIANCA ALTA (imutavel, supply fixo, limites apertados, renuncia ownership)
        address tA = FACTORY.createToken(NortokenERC20.InitParams({
            name: "Flight Alta", symbol: "FTA",
            initialSupply: 1_000_000 * E18, maxCap: 1_000_000 * E18,
            mintable: false, initialOwner: deployer,
            antiSnipeBlocks: 3, tradeCooldownSec: 30, maxWalletBps: 200, maxTxBps: 100, taxBps: 0, taxTreasury: address(0)
        }));

        // Perfil B — CONFIANCA MEDIA
        address tB = FACTORY.createToken(NortokenERC20.InitParams({
            name: "Flight Media", symbol: "FTB",
            initialSupply: 1_000_000 * E18, maxCap: 2_000_000 * E18,
            mintable: true, initialOwner: deployer,
            antiSnipeBlocks: 1, tradeCooldownSec: 0, maxWalletBps: 500, maxTxBps: 200, taxBps: 0, taxTreasury: address(0)
        }));

        // Perfil C — CONFIANCA BAIXA (mintavel, sem teto, sem protecoes)
        address tC = FACTORY.createToken(NortokenERC20.InitParams({
            name: "Flight Baixa", symbol: "FTC",
            initialSupply: 1_000_000 * E18, maxCap: 0,
            mintable: true, initialOwner: deployer,
            antiSnipeBlocks: 0, tradeCooldownSec: 0, maxWalletBps: 0, maxTxBps: 0, taxBps: 0, taxTreasury: address(0)
        }));

        // Particularidade do Perfil A: renunciar ownership -> contrato imutavel
        NortokenERC20(tA).renounceOwnership();

        vm.stopBroadcast();

        console.log("=== TOKENS CRIADOS NA BASE SEPOLIA ===");
        console.log("PERFIL A (ALTA) :", tA);
        console.log("PERFIL B (MEDIA):", tB);
        console.log("PERFIL C (BAIXA):", tC);
    }
}
