// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IApplicationCore} from "./IApplicationCore.sol";
import {OwnableProposalManager} from "./OwnableProposalManager.sol";
import {ApplicationBase} from "./ApplicationBase.sol";

// import "hardhat/console.sol";

contract ApplicationCore is Ownable, IApplicationCore, ApplicationBase, OwnableProposalManager {
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

        _addInterface("installApplication");
        _addInterface("updateMemberManager");
        _addInterface("updateProposalManager");
        _addInterface("updateVoteManager");
        _addInterface("deleteApplication");
        
        _setProposalManager(proposalManager);
    }

    function externalExecuteInterface(
        string memory interfaceName,
        bytes memory data
    ) external override onlyProposalManager {
        if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("installApplication"))
        ) {
            (string memory name, string memory version, address contractAddress) = abi.decode(
                data,
                (string, string, address)
            );
            installApplication(name, version, contractAddress);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("updateMemberManager"))
        ) {
            (address memberManager) = abi.decode(data, (address));
            updateMemberManager(memberManager);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("updateProposalManager"))
        ) {
            (address proposalManager) = abi.decode(data, (address));
            updateProposalManager(proposalManager);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("updateVoteManager"))
        ) {
            (address voteManager) = abi.decode(data, (address));
            updateVoteManager(voteManager);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("deleteApplication"))
        ) {
            (uint256 index) = abi.decode(data, (uint256));
            deleteApplication(index);
        } else {
            revert("ApplicationCore: interface not found");
        }
    }

    function installApplication(
        string memory name,
        string memory version,
        address contractAddress
    ) private {
        //todo: check having application interface
        _applications[_applicationCount] = Application(
            true,
            name,
            version,
            contractAddress
        );
        _applicationCount++;
    }

    function updateMemberManager(address memberManager) private {
        //todo: check having application interface
        _memberManager = memberManager;
    }

    function updateProposalManager(address proposalManager) private {
        //todo: check having application interface
        _proposalManager = proposalManager;
    }

    function updateVoteManager(address voteManager) private {
        //todo: check having application interface
        _voteManager = voteManager;
    }

    function deleteApplication(uint256 index) private {
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
