// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./tokens/IFAVault.sol";
import "./calculators/ICalculator.sol";
import "./components/IFAPool.sol";
import "./components/IFABank.sol";
import "./strategies/CreateIFA.sol";


// Query data related to ifa.
// This contract is owned by Timelock.
contract CalculatorDataBoard is Ownable {
    IFAMaster public ifaMaster;

    constructor(IFAMaster _ifaMaster) public {
        ifaMaster = _ifaMaster;
    }

    function getCalculatorStat(uint256 _poolId) public view returns (uint256, uint256, uint256) {
        ICalculator calculator;
        (,, calculator) = IFABank(ifaMaster.bank()).poolMap(_poolId);
        uint256 rate = calculator.rate();
        uint256 minimumLTV = calculator.minimumLTV();
        uint256 maximumLTV = calculator.maximumLTV();
        return (rate, minimumLTV, maximumLTV);
    }

    function getPendingReward(uint256 _poolId, uint256 _index) public view returns (uint256) {
        IFAVault vault;
        (, vault,) = IFAPool(ifaMaster.pool()).poolMap(_poolId);
        return vault.getPendingReward(msg.sender, _index);
    }

    // return user loan record size.
    function getUserLoanLength(address _who) public view returns (uint256) {
        return IFABank(ifaMaster.bank()).getLoanListLength(_who);
    }

    // return loan info (loanId,principal, interest, lockedAmount, time, rate, maximumLTV)
    function getUserLoan(address _who, uint256 _index) public view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256) {
        uint256 poolId;
        uint256 loanId;
        (poolId, loanId) = IFABank(ifaMaster.bank()).loanList(_who, _index);

        ICalculator calculator;
        (,, calculator) = IFABank(ifaMaster.bank()).poolMap(poolId);

        uint256 lockedAmount = calculator.getLoanLockedAmount(loanId);
        uint256 principal = calculator.getLoanPrincipal(loanId);
        uint256 interest = calculator.getLoanInterest(loanId);
        uint256 time = calculator.getLoanTime(loanId);
        uint256 rate = calculator.getLoanRate(loanId);
        uint256 maximumLTV = calculator.getLoanMaximumLTV(loanId);

        return (loanId, principal, interest, lockedAmount, time, rate, maximumLTV);
    }
}

