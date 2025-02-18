// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IApplicationCore {
    // function installApplication(string memory name,string memory version,address contractAddress) external;
    // function updateMemberManager(address memberManager) external;
    // function updateProposalManager(address proposalManager) external;
    // function updateVoteManager(address voteManager) external;
    // function deleteApplication(uint256 index) external;
    function isInstalledApplication(address applicationAdress) external view returns(bool);
}
