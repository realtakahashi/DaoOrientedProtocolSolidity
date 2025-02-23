// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract OwnableProposalManager {
    address private _proposalManager;

    modifier onlyProposalManager() {
        require(
            _proposalManager != address(0),
            "OwnableProposalManager: proposal manager is not set"
        );
        require(
            msg.sender == _proposalManager,
            "OwnableProposalManager: caller is not the proposal manager"
        );
        _;
    }

    function _setProposalManager(address proposalManager) internal {
        require(
            _proposalManager == address(0),
            "OwnableProposalManager: proposal manager is already set"
        );
        _proposalManager = proposalManager;
    }
}
