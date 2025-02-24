// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IApplication} from "./IApplication.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// import "hardhat/console.sol";

abstract contract ApplicationBase is IApplication, ERC165 {
    string public version;
    uint256 public nextInterfaceId;
    mapping(uint256 interfaceId => string) public _interfaces;

    event AddedInterface(string interfaceName);

    constructor() {
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

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IApplication).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
