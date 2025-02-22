// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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

interface IProposalManager {
    function setManagersAndApplicationCore(
        address applicationCore,
        address memberManager,
        address voteManger
    ) external;

    function addProposal(
        string memory title,
        string memory description,
        address targetContractAddress,
        string memory targetInterface,
        bytes memory parameters
    ) external;

    function executeProposal(uint256 proposalId) external;

    function getProposalList() external view returns (Proposal[] memory);

    function proposalExists(uint256 proposalId) external view returns (bool);
}
