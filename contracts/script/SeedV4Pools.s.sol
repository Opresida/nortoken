// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";

import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {MalleableLiquidityLock} from "../src/lock/MalleableLiquidityLock.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";

/// @notice Semeia N pools v4 reais na Base Sepolia (trio com taxa condicional) pra alimentar
///         a Mazari Fi: cada pool nasce taxada (factory injeta 30 bps), trava liquidez (zera a
///         taxa) e recebe 1 swap (gera SwapTracked p/ o reader de volume/fees). Mirror do
///         SmokeFactory, com FACTORY/LOCK do v4 e {value} reduzido pro saldo do disposable.
contract SeedV4Pools is Script {
    IPoolManager constant MANAGER = IPoolManager(0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408);
    NortokenFactory constant FACTORY = NortokenFactory(0x08De01b7A9a31357f85411Cc526A972E3b1B9917);
    MalleableLiquidityLock constant LOCK = MalleableLiquidityLock(0x82644C1BCA7dB9707C77f6eA8A4984624d350f45);
    uint160 constant SQRT_PRICE_1_1 = 79228162514264337593543950336;

    PoolSwapTest swapRouter;
    address treasury;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        treasury = vm.addr(pk);
        console.log("seeder/treasury:", treasury);
        console.log("saldo inicial (wei):", treasury.balance);

        vm.startBroadcast(pk);
        swapRouter = new PoolSwapTest(MANAGER);

        _seed("Mazari Pool Alpha", "MPALPHA", 0);
        _seed("Mazari Pool Beta", "MPBETA", 100);
        _seed("Mazari Pool Gamma", "MPGAMMA", 200);

        vm.stopBroadcast();
        console.log("saldo final (wei):", treasury.balance);
        console.log("factory ETH (deve ser 0):", address(FACTORY).balance);
    }

    function _seed(string memory name, string memory symbol, uint16 clientFee) internal {
        NortokenERC20.InitParams memory p = NortokenERC20.InitParams({
            name: name,
            symbol: symbol,
            initialSupply: 1_000_000 ether,
            maxCap: 0,
            mintable: false,
            initialOwner: address(0), // factory sobrescreve com o msg.sender
            antiSnipeBlocks: 0,
            tradeCooldownSec: 0,
            maxWalletBps: 0,
            maxTxBps: 0,
            taxBps: 0, // factory injeta 30 bps (PROTOCOL_TAX_BPS)
            taxTreasury: address(0)
        });
        address token = FACTORY.createToken(p);

        // pre-condicoes do passo 2 (owner = seeder)
        NortokenERC20(token).enableTrading();
        NortokenERC20(token).setExempt(address(LOCK), true);
        NortokenERC20(token).approve(address(LOCK), type(uint256).max);

        // passo 2: pool ETH + lock (keeper = Mazari) → factory chama disableTax (limpa)
        NortokenFactory.LockParams memory lp = NortokenFactory.LockParams({
            tickLower: -6000,
            tickUpper: 6000,
            liquidity: 1e15,
            minTick: -6000,
            maxTick: 6000,
            lockDuration: 30 days
        });
        (PoolKey memory key, uint256 lockId) = FACTORY.createPoolAndLock{value: 0.004 ether}(
            token, Currency.wrap(address(0)), 3000, 60, SQRT_PRICE_1_1, lp, clientFee, treasury
        );

        // swap real ETH -> token: aciona o hook (emite SwapTracked p/ a Mazari Fi)
        IPoolManager.SwapParams memory sp = IPoolManager.SwapParams({
            zeroForOne: true,
            amountSpecified: -0.001 ether,
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        });
        swapRouter.swap{value: 0.001 ether}(
            key, sp, PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false}), ""
        );

        (,,,,,,,, address keeper,) = LOCK.locks(lockId);
        console.log("----");
        console.log(name);
        console.log("  token:", token);
        console.log("  lockId:", lockId);
        console.log("  taxBps pos-pool (deve 0):", uint256(NortokenERC20(token).taxBps()));
        console.log("  keeper:", keeper);
    }
}
