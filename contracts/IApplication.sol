// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IApplication {
    function externalExecuteInterface(string memory interfaceName, bytes memory data) external;
    function getInterfaceList() external view returns (string[] memory);
}