// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

enum VoteType {
    FOR,
    AGAINST
}

interface IVoteManager {
    
    function setManagers(address memberManager, address proposalManager) external;

    function createAndStartVote(uint256 proposalId) external;

    function vote(uint256 proposalId, VoteType voteType) external;

    function finishVote(uint256 proposalId) external;

    function isPassed(uint256 proposalId) external view returns (bool);
}
