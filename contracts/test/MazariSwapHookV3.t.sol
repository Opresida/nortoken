// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {MazariSwapHookV3} from "../src/hook/MazariSwapHookV3.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Currency, CurrencyLibrary} from "v4-core/src/types/Currency.sol";

/// @notice Hook v3: cobra DOIS fees no lado-âncora (protocolo 0,2% + cliente configurável),
///         nos dois sentidos, nunca no token volátil. E o owner explícito destrava setAnchor.
contract MazariSwapHookV3Test is Test, Deployers {
    using CurrencyLibrary for Currency;

    MazariSwapHookV3 internal hook;
    address internal protocolTreasury = makeAddr("protocolTreasury");
    address internal clientTreasury = makeAddr("clientTreasury");
    address internal stranger = makeAddr("stranger");

    uint16 internal constant CLIENT_BPS = 200; // 2% do cliente (+ 0,2% protocolo)

    function setUp() public {
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_SWAP_RETURNS_DELTA_FLAG
                | Hooks.AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        address hookAddr = address(flags | (uint160(0x5555) << 144));
        // owner EXPLÍCITO = este contrato de teste (resolve o gap do CREATE2)
        deployCodeTo(
            "MazariSwapHookV3.sol:MazariSwapHookV3",
            abi.encode(IPoolManager(address(manager)), protocolTreasury, address(this)),
            hookAddr
        );
        hook = MazariSwapHookV3(hookAddr);

        hook.setAnchor(currency0, true); // currency0 é o âncora no teste
        (key,) = initPoolAndAddLiquidity(currency0, currency1, IHooks(address(hook)), 3000, SQRT_PRICE_1_1);
        hook.setClientFee(key, CLIENT_BPS, clientTreasury); // owner seta direto
    }

    // ───────────────────────── owner / registrar ─────────────────────────

    function test_OwnerIsExplicit_CanSetAnchor() public {
        // o owner (este contrato) consegue setar âncora — o que NÃO acontecia no v2 sob CREATE2
        assertEq(hook.owner(), address(this));
        hook.setAnchor(currency1, true);
        assertTrue(hook.isAnchor(currency1));
    }

    function test_SetClientFee_OnlyRegistrarOrOwner() public {
        vm.prank(stranger);
        vm.expectRevert(MazariSwapHookV3.NotRegistrar.selector);
        hook.setClientFee(key, 100, clientTreasury);
    }

    function test_SetClientFee_RevertsAboveCap() public {
        vm.expectRevert(MazariSwapHookV3.FeeAboveCap.selector);
        hook.setClientFee(key, 481, clientTreasury); // 20 + 481 = 501 > 500
    }

    function test_SetClientFee_RevertsTreasuryZero() public {
        vm.expectRevert(MazariSwapHookV3.TreasuryRequired.selector);
        hook.setClientFee(key, 100, address(0));
    }

    // ───────────────────────── captura dos dois fees ─────────────────────────

    /// COMPRA (âncora→token, exact-input): proto e cliente saem do INPUT (currency0), valores exatos.
    function test_DualFee_Buying_ExactAmounts() public {
        uint256 p0 = currency0.balanceOf(protocolTreasury);
        uint256 c0 = currency0.balanceOf(clientTreasury);

        uint256 amountIn = 1e15;
        swap(key, true, -int256(amountIn), ZERO_BYTES); // zeroForOne exact-input

        uint256 proto = currency0.balanceOf(protocolTreasury) - p0;
        uint256 cli = currency0.balanceOf(clientTreasury) - c0;

        assertEq(proto, (amountIn * 20) / 10_000, "protocolo = 0,2% do input");
        assertEq(cli, (amountIn * CLIENT_BPS) / 10_000, "cliente = 2% do input");
    }

    /// VENDA (token→âncora): proto e cliente saem do OUTPUT (currency0). Ambos capturados.
    function test_DualFee_Selling_BothCaptured() public {
        uint256 p0 = currency0.balanceOf(protocolTreasury);
        uint256 c0 = currency0.balanceOf(clientTreasury);

        swap(key, false, -int256(uint256(1e15)), ZERO_BYTES); // !zeroForOne exact-input

        uint256 proto = currency0.balanceOf(protocolTreasury) - p0;
        uint256 cli = currency0.balanceOf(clientTreasury) - c0;

        assertGt(proto, 0, "protocolo captura na venda");
        assertGt(cli, 0, "cliente captura na venda");
        assertGt(cli, proto, "taxa do cliente (2%) > protocolo (0,2%)");
    }

    /// Nenhum tesouro recebe o token volátil do cliente (currency1), em nenhum sentido.
    function test_NeverChargesClientToken() public {
        uint256 pBefore = currency1.balanceOf(protocolTreasury);
        uint256 cBefore = currency1.balanceOf(clientTreasury);
        swap(key, true, -int256(uint256(1e15)), ZERO_BYTES); // compra
        swap(key, false, -int256(uint256(1e15)), ZERO_BYTES); // venda
        assertEq(currency1.balanceOf(protocolTreasury), pBefore, "protocolo nunca recebe o token");
        assertEq(currency1.balanceOf(clientTreasury), cBefore, "cliente nunca recebe o proprio token volatil");
    }

    /// MALEABILIDADE: qualquer taxa que o cliente digitar (0% a 4,8%) é capturada EXATA.
    /// O fuzz joga centenas de valores; o teto (protocolo + cliente <= 5%) é respeitado.
    function testFuzz_ClientFee_AnyValueUnderCap(uint16 rawBps) public {
        // o cliente pode escolher de 0 até 480 bps (4,8%); +0,2% protocolo = 5,0% no máximo
        uint16 bps = uint16(bound(rawBps, 0, hook.MAX_TOTAL_FEE_BPS() - hook.PROTOCOL_FEE_BPS()));

        // pool nova (fee tier 500) só pra este valor de taxa
        (key,) = initPoolAndAddLiquidity(currency0, currency1, IHooks(address(hook)), 500, SQRT_PRICE_1_1);
        hook.setClientFee(key, bps, clientTreasury);

        uint256 c0 = currency0.balanceOf(clientTreasury);
        uint256 p0 = currency0.balanceOf(protocolTreasury);
        uint256 amountIn = 1e15;
        swap(key, true, -int256(amountIn), ZERO_BYTES);

        // a taxa do cliente é EXATAMENTE a % digitada; o protocolo é sempre 0,2%
        assertEq(currency0.balanceOf(clientTreasury) - c0, (amountIn * bps) / 10_000, "taxa do cliente exata");
        assertEq(currency0.balanceOf(protocolTreasury) - p0, (amountIn * 20) / 10_000, "protocolo sempre 0,2%");
    }

    /// Sem taxa do cliente (pool sem setClientFee), só o protocolo cobra.
    function test_NoClientFee_OnlyProtocol() public {
        // nova pool sem client fee: reusa currency0/currency1 num fee tier diferente
        (key,) = initPoolAndAddLiquidity(currency0, currency1, IHooks(address(hook)), 500, SQRT_PRICE_1_1);

        uint256 c0 = currency0.balanceOf(clientTreasury);
        uint256 p0 = currency0.balanceOf(protocolTreasury);
        uint256 amountIn = 1e15;
        swap(key, true, -int256(amountIn), ZERO_BYTES);

        assertEq(currency0.balanceOf(clientTreasury) - c0, 0, "sem taxa de cliente nesta pool");
        assertEq(currency0.balanceOf(protocolTreasury) - p0, (amountIn * 20) / 10_000, "protocolo cobra normal");
    }
}
