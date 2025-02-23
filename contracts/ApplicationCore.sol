// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IApplicationCore} from "./IApplicationCore.sol";
import {OwnableProposalManager} from "./OwnableProposalManager.sol";
import {ApplicationBase} from "./ApplicationBase.sol";

// import "hardhat/console.sol";

contract ApplicationCore is
    Ownable,
    IApplicationCore,
    ApplicationBase,
    OwnableProposalManager
{
    struct Application {
        uint256 applicationId;
        bool isPreinstalled;
        string name;
        address contractAddress;
    }

    uint256 public _nextApplicationId;
    mapping(uint256 => Application) public _applications;
    address private _memberManager;
    address private _proposalManager;
    address private _voteManager;

    constructor(
        address memberManager,
        address proposalManager,
        address voteManager
    ) Ownable(msg.sender) {
        _nextApplicationId = 0;
        _applications[_nextApplicationId] = Application(
            _nextApplicationId,
            true,
            "MemberManager",
            memberManager
        );
        _nextApplicationId++;
        _applications[_nextApplicationId] = Application(
            _nextApplicationId,
            true,
            "ProposalManager",
            proposalManager
        );
        _nextApplicationId++;
        _applications[_nextApplicationId] = Application(
            _nextApplicationId,
            true,
            "VoteManager",
            voteManager
        );
        _nextApplicationId++;

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
            (
                string memory name,
                address contractAddress
            ) = abi.decode(data, (string, address));
            installApplication(name, contractAddress);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("updateMemberManager"))
        ) {
            address memberManager = abi.decode(data, (address));
            updateMemberManager(memberManager);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("updateProposalManager"))
        ) {
            address proposalManager = abi.decode(data, (address));
            updateProposalManager(proposalManager);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("updateVoteManager"))
        ) {
            address voteManager = abi.decode(data, (address));
            updateVoteManager(voteManager);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("deleteApplication"))
        ) {
            uint256 applictionId = abi.decode(data, (uint256));
            unInstallApplication(applictionId);
        } else {
            revert("ApplicationCore: interface not found");
        }
    }

    function installApplication(
        string memory name,
        address contractAddress
    ) private {
        //todo: check having application interface
        _applications[_nextApplicationId] = Application(
            _nextApplicationId,
            true,
            name,
            contractAddress
        );
        _nextApplicationId++;
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

    function unInstallApplication(uint256 applicationId) private {
        require(
            _applications[applicationId].contractAddress != address(0),
            "The application does not exists."
        );
        delete _applications[applicationId];
    }

    // function getApplicationList() external returns()

    function isInstalledApplication(
        address applicationAdress
    ) public view returns (bool) {
        for (uint256 i = 0; i < _nextApplicationId; i++) {
            if (_applications[i].contractAddress == applicationAdress) {
                return true;
            }
        }
        return false;
    }
}
