// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {NortokenERC20} from "../src/token/NortokenERC20.sol";
import {NortokenFactory} from "../src/factory/NortokenFactory.sol";
import {NortokenDisperse} from "../src/utils/NortokenDisperse.sol";

/// @notice Teste REAL da distribuição: cria um token e dispersa pras 4 carteiras de teste
///         via o NortokenDisperse — exatamente o que o app faz quando o toggle está ON.
///         forge script script/TestDistribute.s.sol --rpc-url https://sepolia.base.org --broadcast
contract TestDistribute is Script {
    NortokenFactory constant FACTORY = NortokenFactory(0xB6BcE4CaCF4285e64de79Bcbf5Aee69cC65c9C78);
    NortokenDisperse constant DISPERSE = NortokenDisperse(0x8D4bF383051AF366ba76b1ce770B05b28AD6E11e);
    uint256 constant E18 = 1e18;

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PK");
        address deployer = vm.addr(pk);

        address[] memory w = new address[](4);
        w[0] = 0x1fcbB8a83c1E2B95eB071eEB911F33b90Ce27A11;
        w[1] = 0xFa65bC5710Ea92216b5b69c737B94a756A63658d;
        w[2] = 0xFa3c54E46A14B87f815De3096483F55984cea2fB;
        w[3] = 0xD850546089DD338e21b68e03621Ec4004B1da841;

        uint256[] memory a = new uint256[](4);
        a[0] = 300_000 * E18; // 30%
        a[1] = 250_000 * E18; // 25%
        a[2] = 200_000 * E18; // 20%
        a[3] = 150_000 * E18; // 15%  (owner mantem 10% = "reserva/pool")
        uint256 total = 900_000 * E18;

        vm.startBroadcast(pk);
        address token = FACTORY.createToken(NortokenERC20.InitParams({
            name: "Distribuicao Teste", symbol: "DIST",
            initialSupply: 1_000_000 * E18, maxCap: 0,
            mintable: true, initialOwner: deployer,
            antiSnipeBlocks: 0, tradeCooldownSec: 0, maxWalletBps: 0, maxTxBps: 0, taxBps: 0, taxTreasury: address(0)
        }));
        IERC20(token).approve(address(DISPERSE), total);
        DISPERSE.disperseToken(IERC20(token), w, a);
        vm.stopBroadcast();

        console.log("=== TOKEN DISTRIBUIDO ===");
        console.log("token:", token);
        console.log("W1 (30%) tokens:", IERC20(token).balanceOf(w[0]) / E18);
        console.log("W2 (25%) tokens:", IERC20(token).balanceOf(w[1]) / E18);
        console.log("W3 (20%) tokens:", IERC20(token).balanceOf(w[2]) / E18);
        console.log("W4 (15%) tokens:", IERC20(token).balanceOf(w[3]) / E18);
        console.log("Owner (10%) tokens:", IERC20(token).balanceOf(deployer) / E18);
    }
}
