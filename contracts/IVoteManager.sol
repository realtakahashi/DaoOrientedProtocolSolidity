// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

enum VoteType {
    FOR,
    AGAINST
}

interface IVoteManager {
    
    function setMemberManager(address memberManager) external;

    function createAndStartVote(uint256 proposalId) external;

    function vote(uint256 proposalId, VoteType voteType) external;

    function finishVote(uint256 proposalId) external;
}
