// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IApplicationCore} from "./IApplicationCore.sol";
import {OwnableProposalManager} from "./OwnableProposalManager.sol";
import {ApplicationBase} from "./ApplicationBase.sol";
import {IApplication} from "./IApplication.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// import "hardhat/console.sol";

contract ApplicationCore is
    Ownable,
    IApplicationCore,
    ApplicationBase,
    OwnableProposalManager
{
    using Strings for string;
    struct Application {
        uint256 applicationId;
        bool isPreinstalled;
        string name;
        address contractAddress;
    }

    uint256 private _nextApplicationId;
    mapping(uint256 => Application) private _applications;
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
        _addInterface("unInstallApplication");

        _setProposalManager(proposalManager);

        // testCheck(memberManager);
    }

    function externalExecuteInterface(
        string memory interfaceName,
        bytes memory data
    ) external override onlyProposalManager {
        if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("installApplication"))
        ) {
            (string memory name, address contractAddress) = abi.decode(
                data,
                (string, address)
            );
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
            keccak256(abi.encodePacked("unInstallApplication"))
        ) {
            uint256 applictionId = abi.decode(data, (uint256));
            unInstallApplication(applictionId);
        } 
        else {
            revert("ApplicationCore: interface not found");
        }
    }

    function installApplication(
        string memory name,
        address contractAddress
    ) private {
        require(
            checkApplicationInterface(contractAddress),
            "This contract does not have correct interface."
        );
        _applications[_nextApplicationId] = Application(
            _nextApplicationId,
            false,
            name,
            contractAddress
        );
        _nextApplicationId++;
    }

    function updateMemberManager(address memberManager) private {
        require(
            checkApplicationInterface(memberManager),
            "This contract does not have correct interface."
        );
        for(uint256 i=0; i<_nextApplicationId; i++){
            if (_applications[i].name.equal("MemberManager")){
                _memberManager = memberManager;
                _applications[i].contractAddress = memberManager;
                _applications[i].isPreinstalled = false;
                return;
            }
        }
        revert("Unexpeted error is occurred.");
    }

    function updateProposalManager(address proposalManager) private {
        require(
            checkApplicationInterface(proposalManager),
            "This contract does not have correct interface."
        );
        for(uint256 i=0; i<_nextApplicationId; i++){
            if (_applications[i].name.equal("ProposalManager")){
                _proposalManager = proposalManager;
                _applications[i].contractAddress = proposalManager;
                _applications[i].isPreinstalled = false;
                return;
            }
        }
        revert("Unexpeted error is occurred.");
    }

    function updateVoteManager(address voteManager) private {
        require(
            checkApplicationInterface(voteManager),
            "This contract does not have correct interface."
        );
        for(uint256 i=0; i<_nextApplicationId; i++){
            if (_applications[i].name.equal("VoteManager")){
                _voteManager = voteManager;
                _applications[i].contractAddress = voteManager;
                _applications[i].isPreinstalled = false;
                return;
            }
        }
        revert("Unexpeted error is occurred.");
    }

    function unInstallApplication(uint256 applicationId) private {
        require(
            _applications[applicationId].contractAddress != address(0),
            "The application does not exists."
        );
        require(
            _applications[applicationId].isPreinstalled == false,
            "Pre-install application can not be deleted, it can be only updated."
        );
        delete _applications[applicationId];
    }

    function isInstalledApplication(
        address applicationAdress
    ) external view returns (bool) {
        if (applicationAdress == address(this)){
            return true;
        }

        for (uint256 i = 0; i < _nextApplicationId; i++) {
            if (_applications[i].contractAddress == applicationAdress) {
                return true;
            }
        }
        return false;
    }

    function getApplicationList() external view returns(Application[] memory){
        Application[] memory application = new Application[](getApplicationCount());
        uint256 count = 0;
        for (uint256 i=0; i<_nextApplicationId; i++){
            if (_applications[i].contractAddress != address(0)){
                application[count] = _applications[i];
                count++;
            }
        }
        return application;
    }

    function getApplicationCount() private view returns(uint256) {
        uint256 count = 0;
        for (uint256 i=0; i<_nextApplicationId; i++){
            if (_applications[i].contractAddress != address(0)){
                count++;
            }
        }
        return count;
    }

    function checkApplicationInterface(
        address targetContractAddress
    ) private view returns (bool) {
        bytes4 interfaceId = type(IApplication).interfaceId;
        IERC165 target = IERC165(targetContractAddress);
        return target.supportsInterface(interfaceId);
    }

    // function testCheck(address targetContractAddress) private view {
    //     if (checkApplicationInterface(targetContractAddress) == false) {
    //         revert("This contract does not have correct interface.");
    //     }
    // }
}
