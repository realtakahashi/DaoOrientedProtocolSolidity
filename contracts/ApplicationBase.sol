// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// import "hardhat/console.sol";

contract ApplicationBase {
    string public version;
    uint256 public nextInterfaceId;
    mapping(uint256 interfaceId => string) public _interfaces;

    event AddedInterface(string interfaceName);

    constructor(){
        nextInterfaceId = 0;
    }

    function _setVersion(string memory version_) internal {
        version = version_;
    }

    function _addInterface(string memory interfaceName) internal {
        _interfaces[nextInterfaceId] = interfaceName;
        nextInterfaceId++;
        emit AddedInterface(interfaceName);
    }

    function getInterfaceList() external view returns (string[] memory) {
        string[] memory interfaceList = new string[](nextInterfaceId);
        for (uint256 i = 0; i < nextInterfaceId; i++) {
            interfaceList[i] = _interfaces[i];
        }
        return interfaceList;
    }

}
