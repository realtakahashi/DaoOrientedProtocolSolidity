// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// import "hardhat/console.sol";

contract ApplicationCore is Ownable {
    struct Application {
        bool isPreinstalled;
        string name;
        string version;
        address contractAddress;
    }

    uint256 public _applicationCount;
    mapping(uint256 => Application) public _applications;
    address private _memberManager;
    address private _proposalManager;
    address private _voteManager;

    constructor(
        address memberManager,
        address proposalManager,
        address voteManager
    ) Ownable(msg.sender) {
        _applicationCount = 0;
        _applications[_applicationCount] = Application(
            true,
            "MemberManager",
            "0.01",
            memberManager
        );
        _applicationCount++;
        _applications[_applicationCount] = Application(
            true,
            "ProposalManager",
            "0.01",
            proposalManager
        );
        _applicationCount++;
        _applications[_applicationCount] = Application(
            true,
            "VoteManager",
            "0.01",
            voteManager
        );
        _applicationCount++;
    }

    function installApplication(
        string memory name,
        string memory version,
        address contractAddress
    ) public onlyProposalManager {
        //todo: check having application interface
        _applications[_applicationCount] = Application(
            true,
            name,
            version,
            contractAddress
        );
        _applicationCount++;
    }

    function updateMemberManager(address memberManager) public onlyProposalManager {
        //todo: check having application interface
        _memberManager = memberManager;
    }

    function updateProposalManager(address proposalManager) public onlyProposalManager {
        //todo: check having application interface
        _proposalManager = proposalManager;
    }

    function updateVoteManager(address voteManager) public onlyProposalManager {
        //todo: check having application interface
        _voteManager = voteManager;
    }

    function deleteApplication(uint256 index) public onlyProposalManager {
        require(
            index < _applicationCount,
            "Index is out of range of applications"
        );
        delete _applications[index];
    }

    modifier onlyProposalManager() {
        require(
            msg.sender == _proposalManager,
            "Only ProposalManager can call this function"
        );
        _;
    }

}
