// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OwnableMember} from "./OwnableMember.sol";
import {IMemberManager} from "./IMemberManager.sol";
import {IVoteManager, VoteType} from "./IVoteManager.sol";
import {ApplicationBase} from "./ApplicationBase.sol";
import {IProposalManager} from "./IProposalManager.sol";

contract VoteManager is OwnableMember, Ownable, ApplicationBase, IVoteManager {
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
    address private _proposalManager;

    event VoteStarted(uint256 proposalId);

    constructor(uint256 _percentageForApproval, uint256 _minimumVotesPercentage ) Ownable(msg.sender) {
        percentageForApproval = _percentageForApproval;
        minimumVotesPercentage = _minimumVotesPercentage;
        _addInterface("setPercentageForApproval");
        _addInterface("setMinimumVotesPercentage");   
    }

    function externalExecuteInterface(
        string memory interfaceName,
        bytes memory data
    ) external override {
        if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("setPercentageForApproval"))
        ) {
            (uint256 _percentageForApproval) = abi.decode(data, (uint256));
            _setPercentageForApproval(_percentageForApproval);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("setMinimumVotesPercentage"))
        ) {
            (uint256 _minimumVotesPercentage) = abi.decode(data, (uint256));
            _setMinimumVotesPercentage(_minimumVotesPercentage);
        }
        else {
            revert("VoteManager: interface not found");
        }
    }

    function setManagers(address memberManager, address proposalManager) external onlyOwner {
        _proposalManager = proposalManager;
        _memberManager = memberManager;
        _setMemberManager(memberManager);
    }

    function createAndStartVote(
        uint256 proposalId
    ) external onlyElectionCommissioner {
        require(
            IProposalManager(_proposalManager).proposalExists(proposalId),
            "VoteManager: proposal does not exist"
        );
        votes[proposalId] = Vote(0, 0, VoteStatus.Voting);
        emit VoteStarted(proposalId);
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

    function isPassed(uint256 proposalId) external view returns (bool) {
        return votes[proposalId].status == VoteStatus.Approved;
    }

    function _setPercentageForApproval(uint256 _percentageForApproval) internal {
        percentageForApproval = _percentageForApproval;
    }

    function _setMinimumVotesPercentage(uint256 _minimumVotesPercentage) internal {
        minimumVotesPercentage = _minimumVotesPercentage;
    }
}