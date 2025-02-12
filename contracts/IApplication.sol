// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IApplication {
    function externalExecuteInterfase(string memory interfaceName, bytes memory data) external;
}