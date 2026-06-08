// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";

/// @notice Prova on-chain que a FACTORY NOVA injeta a taxa condicional (30 bps) + a isenção
///         anti-dodge. forge script script/TestTaxOnchain.s.sol --rpc-url https://sepolia.base.org --broadcast
contract TestTaxOnchain is Script {
    NortokenFactory constant FACTORY = NortokenFactory(0x08De01b7A9a31357f85411Cc526A972E3b1B9917);
    uint256 constant E18 = 1e18;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);
        address token = FACTORY.createToken(NortokenERC20.InitParams({
            name: "Tax Onchain", symbol: "TAXO",
            initialSupply: 1_000_000 * E18, maxCap: 0, mintable: false, initialOwner: deployer,
            antiSnipeBlocks: 0, tradeCooldownSec: 0, maxWalletBps: 0, maxTxBps: 0,
            taxBps: 0, taxTreasury: address(0) // a factory sobrescreve: 30 bps + tesouro
        }));
        vm.stopBroadcast();

        NortokenERC20 t = NortokenERC20(token);
        console.log("=== TOKEN VIA FACTORY NOVA ===");
        console.log("token:", token);
        console.log("taxBps (esperado 30):", t.taxBps());
        console.log("taxTreasury:", t.taxTreasury());
        console.log("factory do token:", t.factory());
        console.log("taxExempt[owner]  :", t.taxExempt(deployer));
        console.log("taxExempt[treasury]:", t.taxExempt(t.taxTreasury()));
        console.log("isNortoken:", FACTORY.isNortoken(token));
    }
}
