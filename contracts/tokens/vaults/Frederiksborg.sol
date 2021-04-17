// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "../IFAVault.sol";

// Owned by Timelock
contract Frederiksborg is IFAVault {
    // BNB-iBTC UNI-V2 LP (wBNB-iBTC)
    constructor (
        IFAMaster _ifaMaster,
        IStrategy _createIFA,
        IStrategy _shareRevenue
    ) IFAVault(_ifaMaster, "Frederiksborg", "Boil") public  {
        IStrategy[] memory strategies = new IStrategy[](2);
        strategies[0] = _createIFA;
        strategies[1] = _shareRevenue;
        setStrategies(strategies);
    }
}
