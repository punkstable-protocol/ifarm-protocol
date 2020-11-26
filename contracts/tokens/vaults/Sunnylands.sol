// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "../IFAVault.sol";

// Owned by Timelock
contract Sunnylands is IFAVault {
    // seed wBTC, harvest IFA, borrow iBTC
    constructor (
        IFAMaster _ifaMaster,
        IStrategy _createIFA
    ) IFAVault(_ifaMaster, "Sunnylands", "SNAIL") public  {
        IStrategy[] memory strategies = new IStrategy[](1);
        strategies[0] = _createIFA;
        setStrategies(strategies);
    }
}
