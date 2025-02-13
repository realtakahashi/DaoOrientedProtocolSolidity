// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IApplicationCore} from "./IApplicationCore.sol";
import {OwnableProposalManager} from "./OwnableProposalManager.sol";

// import "hardhat/console.sol";

contract ApplicationCore is Ownable, IApplicationCore, OwnableProposalManager {
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

        _setProposalManager(proposalManager);
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

    function isInstalledApplication(address applicationAdress)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < _applicationCount; i++) {
            if (_applications[i].contractAddress == applicationAdress) {
                return true;
            }
        }
        return false;
    }
}
