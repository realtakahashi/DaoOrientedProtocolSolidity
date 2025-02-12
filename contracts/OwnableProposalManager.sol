// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract OwnableProposalManager {
    address private _proposalManager;

    modifier onlyProposalManager() {
        require(
            msg.sender == _proposalManager,
            "OwnableProposalManager: caller is not the proposal manager"
        );
        _;
    }

    modifier alreadySetProposalManager() {
        require(
            _proposalManager != address(0),
            "OwnableProposalManager: proposal manager is not set"
        );
        _;
    }

    function setProposalManager(address proposalManager) internal {
        _proposalManager = proposalManager;
    }
}