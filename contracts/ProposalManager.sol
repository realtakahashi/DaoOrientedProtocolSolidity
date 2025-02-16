// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IApplication} from "./IApplication.sol";
import {OwnableMember} from "./OwnableMember.sol";
import {ApplicationBase} from "./ApplicationBase.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IApplicationCore} from "./IApplicationCore.sol";
import {IVoteManager} from "./IVoteManager.sol";

contract ProposalManager is Ownable, OwnableMember, ApplicationBase {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        address targetContractAddress;
        string targetInterface;
        bytes parameters;
        bool isExecuted;
    }

    uint256 public _nextProposalId;
    address private _applicationCore;
    address private _voteManager;
    mapping(uint256 proposalId => Proposal) public _proposals;

    constructor() Ownable(msg.sender) {
        _setVersion("1.0.0");
        _addInterface("");
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
    }

    function createAndStartVoging(
        uint256 proposalId
    ) external onlyElectionCommissioner {
        IVoteManager(_voteManager).createAndStartVote(proposalId);
    }

    function executeProposal(
        uint256 proposalId
    ) external onlyElectionCommissioner {
        // todo: check voting result
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

        IApplication(proposal.targetContractAddress).externalExecuteInterface(
            proposal.targetInterface,
            proposal.parameters
        );
        proposal.isExecuted = true;
    }
}
