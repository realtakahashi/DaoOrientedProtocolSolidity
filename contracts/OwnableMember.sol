// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IMemberManager} from "./IMemberManager.sol";

contract OwnableMember {
    address private _memberManager;

    modifier onlyMember() {
        require(
            _checkMember(),
            "OwnableMemberManager: caller is not the member manager"
        );
        _;
    }

    modifier onlyElectionCommissioner() {
        require(
            _checkElectionCommissioner(),
            "OwnableMemberManager: caller is not the election commissioner"
        );
        _;
    }

    function _setMemberManager(address memberManager) internal {
        _memberManager = memberManager;
    }

    function _checkMember() private view returns (bool) {
        return IMemberManager(_memberManager).isMember(msg.sender);
    }

    function _checkElectionCommissioner() private view returns (bool) {
        return IMemberManager(_memberManager).isElectionCommissioner(msg.sender);
    }
}