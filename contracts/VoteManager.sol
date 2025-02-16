// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OwnableMember} from "./OwnableMember.sol";
import {IMemberManager} from "./IMemberManager.sol";
import {IVoteManager, VoteType} from "./IVoteManager.sol";

contract VoteManager is OwnableMember, Ownable, IVoteManager {


    enum VoteStatus {
        Voting,
        Approved,
        Rejected
    }

    struct Vote {
        uint256 yesVotes;
        uint256 noVotes;
        VoteStatus status;
    }

    mapping(uint256 proposalId => mapping(address => uint256)) public memberVotes;
    mapping(uint256 proposalId => Vote) public votes;
    uint256 public percentageForApproval;
    uint256 public minimumVotesPercentage;

    address private _memberManager;

    constructor(uint256 _percentageForApproval, uint256 _minimumVotesPercentage ) Ownable(msg.sender) {
        percentageForApproval = _percentageForApproval;
        minimumVotesPercentage = _minimumVotesPercentage;
    }

    function setMemberManager(address memberManager) external onlyOwner {
        _memberManager = memberManager;
    }

    function createAndStartVote(
        uint256 proposalId
    ) public onlyElectionCommissioner {
        votes[proposalId] = Vote(0, 0, VoteStatus.Voting);
    }

    function vote(uint256 proposalId, VoteType voteType) external onlyMember {
        require(
            votes[proposalId].status == VoteStatus.Voting,
            "VoteManager: vote is not in progress"
        );
        require(
            memberVotes[proposalId][msg.sender] == 0,
            "VoteManager: member has already voted"
        );

        if (voteType == VoteType.FOR) {
            votes[proposalId].yesVotes++;
        } else {
            votes[proposalId].noVotes++;
        }

        memberVotes[proposalId][msg.sender] = 1;
    }

    function finishVote(uint256 proposalId) external onlyElectionCommissioner {
        require(
            votes[proposalId].status == VoteStatus.Voting,
            "VoteManager: vote is not in progress"
        );

        uint256 totalVotes = votes[proposalId].yesVotes + votes[proposalId].noVotes;
        uint256 yesVotesPercentage = (votes[proposalId].yesVotes * 100) / totalVotes;
        uint256 memberCount = IMemberManager(_memberManager).getMemberCount();

        if (totalVotes/memberCount*100 < minimumVotesPercentage) {
            votes[proposalId].status = VoteStatus.Rejected;
        }
        else if (yesVotesPercentage >= percentageForApproval) {
            votes[proposalId].status = VoteStatus.Approved;
        } else {
            votes[proposalId].status = VoteStatus.Rejected;
        }
    }
}