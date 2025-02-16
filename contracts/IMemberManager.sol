// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMemberManager {
    function isMember(address eoaAddress) external view returns (bool);
    function isElectionCommissioner(address eoaAddress) external view returns (bool);
    function getMemberCount() external view returns (uint256);
}