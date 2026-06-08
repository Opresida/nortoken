// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";

/// @notice TESTE DE VOO — cria tokens via a FACTORY REAL (Base Sepolia, fork) com 3 níveis
///         de confiabilidade e VERIFICA que o contrato pegou as particularidades de lançamento
///         (mintable, cap, anti-snipe, cooldown, max wallet/tx, owner, renúncia, registro).
///         Roda contra o bytecode realmente deployado, sem chave/custo:
///         forge test --match-path test/FlightTest.t.sol --fork-url https://sepolia.base.org -vv
contract FlightTest is Test {
    NortokenFactory constant FACTORY = NortokenFactory(0xB6BcE4CaCF4285e64de79Bcbf5Aee69cC65c9C78);
    uint256 constant E18 = 1e18;

    function _check(string memory tag, address t, NortokenERC20.InitParams memory p) internal {
        NortokenERC20 tok = NortokenERC20(t);

        console.log("");
        console.log(tag);
        console.log("  token        :", t);
        console.log("  name         :", tok.name());
        console.log("  symbol       :", tok.symbol());
        console.log("  totalSupply  :", tok.totalSupply());
        console.log("  mintable     :", tok.mintable());
        console.log("  cap          :", tok.cap());
        console.log("  antiSnipeBlk :", uint256(tok.antiSnipeBlocks()));
        console.log("  cooldownSec  :", uint256(tok.tradeCooldownSec()));
        console.log("  maxWalletBps :", uint256(tok.maxWalletBps()));
        console.log("  maxTxBps     :", uint256(tok.maxTxBps()));
        console.log("  owner        :", tok.owner());
        console.log("  isNortoken   :", FACTORY.isNortoken(t));

        // ASSERTS: o contrato pegou EXATAMENTE o que foi enviado
        assertEq(tok.totalSupply(), p.initialSupply, "supply divergiu");
        assertEq(tok.mintable(), p.mintable, "mintable divergiu");
        assertEq(tok.cap(), p.maxCap, "cap divergiu");
        assertEq(uint256(tok.antiSnipeBlocks()), uint256(p.antiSnipeBlocks), "antiSnipe divergiu");
        assertEq(uint256(tok.tradeCooldownSec()), uint256(p.tradeCooldownSec), "cooldown divergiu");
        assertEq(uint256(tok.maxWalletBps()), uint256(p.maxWalletBps), "maxWallet divergiu");
        assertEq(uint256(tok.maxTxBps()), uint256(p.maxTxBps), "maxTx divergiu");
        assertEq(tok.owner(), address(this), "owner != criador");
        assertTrue(FACTORY.isNortoken(t), "factory nao registrou");
    }

    function test_FlightDeploy_AllTrustProfiles() public {
        console.log("===== TESTE DE VOO: 3 PERFIS DE CONFIABILIDADE =====");
        console.log("factory:", address(FACTORY));

        // ---- Perfil A: CONFIANCA ALTA (imutavel, travado, limitado) ----
        NortokenERC20.InitParams memory A = NortokenERC20.InitParams({
            name: "FlightTest Alta",
            symbol: "FTA",
            initialSupply: 1_000_000 * E18,
            maxCap: 1_000_000 * E18, // = supply (fixo, sem inflacao)
            mintable: false,
            initialOwner: address(this),
            antiSnipeBlocks: 3,
            tradeCooldownSec: 30,
            maxWalletBps: 200,
            maxTxBps: 100, taxBps: 0, taxTreasury: address(0)
        });
        address tA = FACTORY.createToken(A);
        _check("PERFIL A (ALTA)", tA, A);

        // ---- Perfil B: CONFIANCA MEDIA ----
        NortokenERC20.InitParams memory B = NortokenERC20.InitParams({
            name: "FlightTest Media",
            symbol: "FTB",
            initialSupply: 1_000_000 * E18,
            maxCap: 2_000_000 * E18,
            mintable: true,
            initialOwner: address(this),
            antiSnipeBlocks: 1,
            tradeCooldownSec: 0,
            maxWalletBps: 500,
            maxTxBps: 200, taxBps: 0, taxTreasury: address(0)
        });
        address tB = FACTORY.createToken(B);
        _check("PERFIL B (MEDIA)", tB, B);

        // ---- Perfil C: CONFIANCA BAIXA (mintavel, sem teto, sem protecoes) ----
        NortokenERC20.InitParams memory C = NortokenERC20.InitParams({
            name: "FlightTest Baixa",
            symbol: "FTC",
            initialSupply: 1_000_000 * E18,
            maxCap: 0, // ilimitado
            mintable: true,
            initialOwner: address(this),
            antiSnipeBlocks: 0,
            tradeCooldownSec: 0,
            maxWalletBps: 0,
            maxTxBps: 0, taxBps: 0, taxTreasury: address(0)
        });
        address tC = FACTORY.createToken(C);
        _check("PERFIL C (BAIXA)", tC, C);

        // ---- Particularidade extra do Perfil A: renuncia de ownership ----
        NortokenERC20(tA).renounceOwnership();
        assertEq(NortokenERC20(tA).owner(), address(0), "A: renuncia falhou");
        console.log("");
        console.log("PERFIL A: ownership renunciado -> owner agora e address(0) (imutavel)");

        // ---- Particularidade extra do Perfil C: mint apos deploy (porque mintable=true) ----
        NortokenERC20(tC).mint(address(0xBEEF), 123 * E18);
        assertEq(NortokenERC20(tC).balanceOf(address(0xBEEF)), 123 * E18, "C: mint falhou");
        console.log("PERFIL C: mint pos-deploy OK (mintable=true) -> +123 tokens");

        // ---- E o Perfil A NAO pode mintar (mintable=false) ----
        vm.expectRevert();
        NortokenERC20(tA).mint(address(0xBEEF), 1);
        console.log("PERFIL A: mint REVERTEU como esperado (mintable=false)");

        console.log("");
        console.log("===== TODOS OS 3 PERFIS: CONTRATO PEGOU AS PARTICULARIDADES =====");
    }
}
