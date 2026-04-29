// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LastHero} from "../src/LastHero.sol";

interface Vm {
    function envUint(string calldata key) external view returns (uint256 value);
    function envAddress(string calldata key) external view returns (address value);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployLastHero {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (LastHero game) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address devWallet = vm.envAddress("DEV_WALLET");

        vm.startBroadcast(deployerKey);
        game = new LastHero(devWallet);
        vm.stopBroadcast();
    }
}
