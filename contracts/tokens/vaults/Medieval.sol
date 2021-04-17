// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "../IFAVault.sol";

// Owned by Timelock
contract Medieval is IFAVault {
    // BUNNY-iUSD UNI-V2 LP  (BUNNY-iUSD)
    
    constructor (
        IFAMaster _ifaMaster,
        IStrategy _createIFA,
        IStrategy _shareRevenue
    ) IFAVault(_ifaMaster, "Medieval", "Boil") public  {
        IStrategy[] memory strategies = new IStrategy[](2);
        strategies[0] = _createIFA;
        strategies[1] = _shareRevenue;
        setStrategies(strategies);
    }
}
