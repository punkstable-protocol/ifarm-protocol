// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../IFAMaster.sol";

// This contract is owned by Timelock.
contract IFARevenue is Ownable {

    IFAMaster public ifaMaster;
    uint256 constant K_STRATEGY_SHARE_REVENUE = 1;

    constructor(IFAMaster _ifaMaster) public {
        ifaMaster = _ifaMaster;
    }

    // Only shareRevenue can call this method. Currently _token are IFA.
    function distribute(address _token) external {
        address shareRevenue = ifaMaster.strategyByKey(K_STRATEGY_SHARE_REVENUE);
        require(msg.sender == shareRevenue, "sender not share-revenue");

        address costco = ifaMaster.costco();

        uint256 amount = IERC20(_token).balanceOf(address(this));
        // 10% goes to costco.
        IERC20(_token).transfer(costco, amount / 10);
        // 90% goes to IFA/{Token}-UNI_LP holders.
        IERC20(_token).transfer(shareRevenue, amount - amount / 10);
    }
}