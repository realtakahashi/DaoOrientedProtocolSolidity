// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { console } from "hardhat/console.sol";

import {IApplication} from "./IApplication.sol";
import {OwnableMember} from "./OwnableMember.sol";
import {ApplicationBase} from "./ApplicationBase.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IApplicationCore} from "./IApplicationCore.sol";
import {IVoteManager} from "./IVoteManager.sol";
import {IProposalManager, Proposal} from "./IProposalManager.sol";

contract ProposalManager is Ownable, OwnableMember, ApplicationBase, IProposalManager {

    uint256 private _nextProposalId;
    address private _applicationCore;
    address private _voteManager;
    mapping(uint256 proposalId => Proposal) private _proposals;

    event ProposalAdded(
        uint256 proposalId,
        string title,
        string description,
        address proposer,
        address targetContractAddress,
        string targetInterface,
        bytes parameters
    );

    constructor() Ownable(msg.sender) {
        _setVersion("1.0.0");
        _addInterface("");
        _nextProposalId = 0;
    }

    function setManagersAndApplicationCore(
        address applicationCore,
        address memberManager,
        address voteManger
    ) external onlyOwner {
        _setMemberManager(memberManager);
        _voteManager = voteManger;
        _applicationCore = applicationCore;
    }

    function externalExecuteInterface(
        string memory interfaceName,
        bytes memory data
    ) external override {}

    function addProposal(
        string memory title,
        string memory description,
        address targetContractAddress,
        string memory targetInterface,
        bytes memory parameters
    ) external onlyMember {
        require(
            IApplicationCore(_applicationCore).isInstalledApplication(
                targetContractAddress
            ),
            "ProposalManager: target contract is not installed"
        );

        _proposals[_nextProposalId] = Proposal(
            _nextProposalId,
            title,
            description,
            msg.sender,
            targetContractAddress,
            targetInterface,
            parameters,
            false
        );
        _nextProposalId++;

        emit ProposalAdded(
            _nextProposalId - 1,
            title,
            description,
            msg.sender,
            targetContractAddress,
            targetInterface,
            parameters
        );

    }

    function executeProposal(
        uint256 proposalId
    ) external onlyElectionCommissioner {
        Proposal storage proposal = _proposals[proposalId];
        require(
            !proposal.isExecuted,
            "ProposalManager: proposal is already executed"
        );
        require(
            IApplicationCore(_applicationCore).isInstalledApplication(
                proposal.targetContractAddress
            ),
            "ProposalManager: target contract is not installed"
        );
        require(IVoteManager(_voteManager).isPassed(proposalId), "ProposalManager: vote is not approved");

        IApplication(proposal.targetContractAddress).externalExecuteInterface(
            proposal.targetInterface,
            proposal.parameters
        );
        proposal.isExecuted = true;
    }

    function getProposalList() external view returns (Proposal[] memory) {
        Proposal[] memory proposals = new Proposal[](_nextProposalId);
        for (uint256 i = 0; i < _nextProposalId; i++) {
            proposals[i] = _proposals[i];
        }
        return proposals;
    }

    function proposalExists(uint256 proposalId) external view returns (bool) {
        return _proposals[proposalId].proposer != address(0);
    }
}
