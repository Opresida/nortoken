// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {LaunchProtection} from "../src/token/modules/LaunchProtection.sol";

contract NortokenERC20Test is Test {
    NortokenERC20 internal token;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant SUPPLY = 1_000_000 ether;

    function _deploy(
        uint16 maxWalletBps,
        uint16 maxTxBps,
        uint64 antiSnipe,
        uint64 cooldown,
        bool mintable,
        uint256 maxCap
    ) internal {
        NortokenERC20.InitParams memory p = NortokenERC20.InitParams({
            name: "Test Token",
            symbol: "TST",
            initialSupply: SUPPLY,
            maxCap: maxCap,
            mintable: mintable,
            initialOwner: owner,
            antiSnipeBlocks: antiSnipe,
            tradeCooldownSec: cooldown,
            maxWalletBps: maxWalletBps,
            maxTxBps: maxTxBps, taxBps: 0, taxTreasury: address(0)
        });
        vm.prank(owner);
        token = new NortokenERC20(p);
    }

    function setUp() public {
        _deploy(0, 0, 0, 0, true, 0);
    }

    // ─────────────────────────── básicos ───────────────────────────

    function test_InitialState() public view {
        assertEq(token.totalSupply(), SUPPLY);
        assertEq(token.balanceOf(owner), SUPPLY);
        assertEq(token.owner(), owner);
        assertTrue(token.mintable());
        assertTrue(token.isExempt(owner));
        assertTrue(token.isExempt(address(token)));
    }

    function test_OnlyOwnerMint() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1 ether);

        vm.prank(owner);
        token.mint(alice, 100 ether);
        assertEq(token.balanceOf(alice), 100 ether);
    }

    function test_RenounceMintIsPermanent() public {
        vm.prank(owner);
        token.renounceMint();
        assertFalse(token.mintable());
        vm.prank(owner);
        vm.expectRevert(NortokenERC20.MintingDisabled.selector);
        token.mint(owner, 1 ether);
    }

    function test_CapEnforced() public {
        _deploy(0, 0, 0, 0, true, SUPPLY + 500 ether);
        vm.prank(owner);
        vm.expectRevert(NortokenERC20.CapExceeded.selector);
        token.mint(owner, 600 ether);
        vm.prank(owner);
        token.mint(owner, 500 ether); // exatamente no cap: ok
        assertEq(token.totalSupply(), SUPPLY + 500 ether);
    }

    function test_PauseBlocksTransfers() public {
        vm.prank(owner);
        token.enableTrading();
        vm.prank(owner);
        token.transfer(alice, 10 ether); // owner exempt
        vm.prank(owner);
        token.pause();
        vm.prank(alice);
        vm.expectRevert(NortokenERC20.TransfersPaused.selector);
        token.transfer(bob, 1 ether);
    }

    // ─────────────────────── proteções de lançamento ───────────────────────

    function test_TradingDisabledBlocksNonExempt() public {
        vm.prank(owner);
        token.transfer(alice, 100 ether); // owner exempt → ok
        vm.prank(alice);
        vm.expectRevert(LaunchProtection.TradingNotEnabled.selector);
        token.transfer(bob, 1 ether);
    }

    function test_AntiSnipeBlocksThenReleases() public {
        _deploy(0, 0, 5, 0, true, 0); // 5 blocos de anti-snipe
        vm.startPrank(owner);
        token.transfer(alice, 100 ether);
        token.enableTrading();
        vm.stopPrank();

        // mesmo bloco do launch: sniper barrado
        vm.prank(alice);
        vm.expectRevert(LaunchProtection.SnipeBlocked.selector);
        token.transfer(bob, 1 ether);

        // após os 5 blocos: liberado
        vm.roll(block.number + 5);
        vm.prank(alice);
        token.transfer(bob, 1 ether);
        assertEq(token.balanceOf(bob), 1 ether);
    }

    function test_MaxTxOnlyWithinWindow() public {
        // maxTx = 1% do supply
        _deploy(0, 100, 0, 0, true, 0);
        vm.startPrank(owner);
        token.transfer(alice, 50_000 ether);
        token.enableTrading();
        vm.stopPrank();

        uint256 overLimit = (SUPPLY * 100) / 10_000 + 1; // > 1%
        vm.prank(alice);
        vm.expectRevert(LaunchProtection.MaxTxExceeded.selector);
        token.transfer(bob, overLimit);

        // após a janela: limite cai
        vm.warp(block.timestamp + token.GUARD_WINDOW() + 1);
        vm.prank(alice);
        token.transfer(bob, overLimit);
        assertEq(token.balanceOf(bob), overLimit);
    }

    // ──────────────── INVARIANTE DE SELLABILITY (honeypot-free) ────────────────
    // Núcleo da Fase 1: após a janela de lançamento, QUALQUER holder vende QUALQUER
    // quantia sem reverter e sem perder valor. Se isto vale para todo (holder, valor),
    // o contrato NÃO PODE ser honeypot.

    function testFuzz_SellabilityAfterWindow(uint256 seed, uint256 amount, address buyer) public {
        // proteções ligadas no lançamento (anti-snipe + cooldown + anti-whale)
        _deploy(200, 100, 10, 30, true, 0); // maxWallet 2%, maxTx 1%, 10 blocos, 30s cooldown

        vm.assume(buyer != address(0) && buyer != owner && buyer != alice);
        vm.assume(buyer.code.length == 0); // EOA (evita receivers que revertem)

        seed = bound(seed, 1, token.balanceOf(owner));
        // owner é exempt → distribui pra alice livremente
        vm.prank(owner);
        token.transfer(alice, seed);

        // habilita trading e avança PARA ALÉM de toda trava (anti-snipe + janela)
        vm.prank(owner);
        token.enableTrading();
        vm.roll(block.number + 11);
        vm.warp(block.timestamp + token.GUARD_WINDOW() + 1);

        amount = bound(amount, 1, seed);

        uint256 buyerBefore = token.balanceOf(buyer);
        // a "venda" (transfer do holder) NUNCA reverte e entrega o valor cheio
        vm.prank(alice);
        token.transfer(buyer, amount);

        assertEq(token.balanceOf(buyer), buyerBefore + amount, "comprador deve receber o valor cheio");
        assertEq(token.sellQuote(amount), amount, "sellQuote sem fee no token");
    }
}
