// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ApplicationBase} from "./ApplicationBase.sol";
import {OwnableProposalManager} from "./OwnableProposalManager.sol";
import {IMemberManager} from "./IMemberManager.sol";

// import "hardhat/console.sol";

contract MemberManager is Ownable, ApplicationBase, OwnableProposalManager, IMemberManager {
    struct Member {
        string name;
        address eoaAddress;
        bool isElectionCommissioner;
    }

    uint256 public _nextMemberId;
    mapping(uint256 => Member) public _members;

    event MemberAdded(string name, address eoaAddress);
    event MemberDeleted(uint256 memberId);
    event ElectionCommissionerChanged(uint256 memberId);

    constructor(
        string memory nameOfFirstMember,
        address eoaAddressOfFirstMember
    ) Ownable(msg.sender) {
        _nextMemberId = 0;
        _addMemeber(nameOfFirstMember, eoaAddressOfFirstMember, true);
        _setVersion("0.01");
        _addInterface("addMember");
        _addInterface("deleteMember");
        _addInterface("resetElectionCommissioner");
    }

    function setProposalManager(address proposalManager) external onlyOwner {
        _setProposalManager(proposalManager);
    }

    function externalExecuteInterfase(
        string memory interfaceName,
        bytes memory data
    ) external alreadySetProposalManager onlyProposalManager {
        if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("addMember"))
        ) {
            (string memory name, address eoaAddress) = abi.decode(
                data,
                (string, address)
            );
            _addlMember(name, eoaAddress);
        } else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("deleteMember"))
        ) {
            uint256 memberId = abi.decode(data, (uint256));
            _deleteMember(memberId);
        }else if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("resetElectionCommissioner"))
        ) {
            uint256 memberId = abi.decode(data, (uint256));
            resetElectionCommissioner(memberId);
        }
        else {
            revert("The interface is not supported");
        }
    }

    function isMember(address eoaAddress)
        external
        view
        override
        returns (bool)
    {
        for (uint256 i = 0; i < _nextMemberId; i++) {
            if (_members[i].eoaAddress == eoaAddress) {
                return true;
            }
        }
        return false;
    }

    function isElectionCommissioner(address eoaAddress)
        external
        view
        override
        returns (bool)
    {
        for (uint256 i = 0; i < _nextMemberId; i++) {
            if (_members[i].eoaAddress == eoaAddress) {
                return _members[i].isElectionCommissioner;
            }
        }
        return false;
    }

    function _addlMember(string memory name, address eoaAddress) private {
        _addMemeber(name, eoaAddress, false);
    }

    function _deleteMember(uint256 memberId) private {
        delete _members[memberId];
        emit MemberDeleted(memberId);
    }

    function _addMemeber(
        string memory name,
        address eoaAddress,
        bool isElectionCommissionerFlg
    ) private {
        _members[_nextMemberId] = Member(
            name,
            eoaAddress,
            isElectionCommissionerFlg
        );
        _nextMemberId++;
        emit MemberAdded(name, eoaAddress);
    }

    function resetElectionCommissioner(uint256 memberId) private {
        for(uint256 i = 0; i < _nextMemberId; i++) {
            _members[i].isElectionCommissioner = false;
        }
        _members[memberId].isElectionCommissioner = true;
        emit ElectionCommissionerChanged(memberId);
    }

}
