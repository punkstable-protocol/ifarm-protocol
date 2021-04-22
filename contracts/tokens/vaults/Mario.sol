// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "../IFAVault.sol";

// Owned by Timelock
contract Mario is IFAVault {
    // DODO-iBTC UNI-V2 LP  (DODO-iBTC)
    
    constructor (
        IFAMaster _ifaMaster,
        IStrategy _createIFA,
        IStrategy _shareRevenue
    ) IFAVault(_ifaMaster, "Mario", "Boil") public  {
        IStrategy[] memory strategies = new IStrategy[](2);
        strategies[0] = _createIFA;
        strategies[1] = _shareRevenue;
        setStrategies(strategies);
    }
}
