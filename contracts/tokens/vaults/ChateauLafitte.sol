// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "../IFAVault.sol";

// Owned by Timelock
contract ChateauLafitte is IFAVault {
    // seed wETH, harvest IFA, borrow iETH
    // origin code: wETH Vault
    constructor (
        IFAMaster _ifaMaster,
        IStrategy _createIFA
    ) IFAVault(_ifaMaster, "Château Lafitte", "SNAIL") public  {
        IStrategy[] memory strategies = new IStrategy[](1);
        strategies[0] = _createIFA;
        setStrategies(strategies);
    }
}
