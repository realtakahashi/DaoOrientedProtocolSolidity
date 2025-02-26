// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import {ApplicationBase} from "./ApplicationBase.sol";
import {OwnableProposalManager} from "./OwnableProposalManager.sol";

contract ExampleStorage is ApplicationBase, OwnableProposalManager {
    uint256 private number;

    constructor(address proposalManager, uint256 initialValue) {
        _setProposalManager(proposalManager);
        _addInterface("store");

        number = initialValue;
    }

    function externalExecuteInterface(
        string memory interfaceName,
        bytes memory data
    ) external onlyProposalManager {
        if (
            keccak256(abi.encodePacked(interfaceName)) ==
            keccak256(abi.encodePacked("store"))
        ) {
            uint256 num = abi.decode(data, (uint256));
            store(num);
        }
    }

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) private {
        number = num;
    }

    /**
     * @dev Return value
     * @return value of 'number'
     */
    function retrieve() external view returns (uint256) {
        return number;
    }
}
