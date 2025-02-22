// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct Member {
    string name;
    address eoaAddress;
    bool isElectionCommissioner;
}

interface IMemberManager {
    function isMember(address eoaAddress) external view returns (bool);

    function isElectionCommissioner(
        address eoaAddress
    ) external view returns (bool);

    function getMemberCount() external view returns (uint256);

    function getMemberList() external view returns (Member[] memory);
}
