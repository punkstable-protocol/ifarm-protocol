// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../tokens/IiToken.sol";
import "../tokens/IFAVault.sol";
import "../calculators/ICalculator.sol";
import "./Parities.sol";


// IFABank produces {iUSD/iBTC/iETH} by locking user's vault assets.
// This contract is owned by Timelock.
contract IFABank is Parities, Ownable {
    using SafeMath for uint256;

    // Info of each pool.
    struct PoolInfo {
        IiToken itoken;
        IFAVault vault;           // Address of vault contract.
        ICalculator calculator;
    }

    // PoolInfo by poolId.
    mapping(uint256 => PoolInfo) public poolMap;

    // Info of each loan.
    struct LoanInfo {
        uint256 poolId;  // Corresponding asset of the loan.
        uint256 loanId;  // LoanId of the loan.
    }

    // Loans of each user.
    mapping(address => LoanInfo[]) public loanList;

    event Borrow(address indexed user, uint256 indexed index, uint256 indexed poolId, uint256 amount);
    event PayBackInFull(address indexed user, uint256 indexed index);
    event CollectDebt(address indexed user, uint256 indexed poolId, uint256 loanId);
    event PayBackPartially(address indexed user, uint256 indexed index, uint256 amount);

    constructor(IFAMaster _ifaMaster) Parities(_ifaMaster) public {
    }

    // Set pool info.
    function setPoolInfo(uint256 _poolId, IiToken _itoken, IFAVault _vault, ICalculator _calculator) public onlyOwner {
        poolMap[_poolId].itoken = _itoken;
        poolMap[_poolId].vault = _vault;
        poolMap[_poolId].calculator = _calculator;
    }

    // Return length of address loan
    function getLoanListLength(address _who) external view returns (uint256) {
        return loanList[_who].length;
    }


    // Lend iToken to create a new loan by locking vault.
    function borrow(uint256 _poolId, uint256 _amount) external {
        PoolInfo storage pool = poolMap[_poolId];
        require(address(pool.calculator) != address(0), "no calculator");

        uint256 loanId = pool.calculator.getNextLoanId();
        pool.calculator.borrow(msg.sender, _amount);
        uint256 lockedAmount = pool.calculator.getLoanLockedAmount(loanId);
        // Locks in vault.
        pool.vault.lockByBank(msg.sender, lockedAmount);

        // Give user iETH/{iUSD}/{iBTC} or other iTokens.
        pool.itoken.mint(msg.sender, _amount);

        // Records the loan.
        LoanInfo memory loanInfo;
        loanInfo.poolId = _poolId;
        loanInfo.loanId = loanId;
        loanList[msg.sender].push(loanInfo);

        emit Borrow(msg.sender, loanList[msg.sender].length - 1, _poolId, _amount);
    }

    // Pay back to a loan fully.
    function payBackInFull(uint256 _index) external {
        require(_index < loanList[msg.sender].length, "getTotalLoan: index out of range");
        PoolInfo storage pool = poolMap[loanList[msg.sender][_index].poolId];
        require(address(pool.calculator) != address(0), "no calculator");

        uint256 loanId = loanList[msg.sender][_index].loanId;
        uint256 lockedAmount = pool.calculator.getLoanLockedAmount(loanId);
        uint256 principal = pool.calculator.getLoanPrincipal(loanId);
        uint256 interest = pool.calculator.getLoanInterest(loanId);
        // Burn principal.
        pool.itoken.burnFrom(msg.sender, principal);

        // Transfer interest to ifaRevenue, which settled with IFA
        uint256 payIFAAmount = interest.mul(getIFAToiTokenRate(address(pool.itoken))).div(100);
        IERC20(ifaMaster.ifa()).transferFrom(msg.sender, ifaMaster.revenue(), payIFAAmount);

        pool.calculator.payBackInFull(loanId);
        // Unlocks in vault.
        pool.vault.unlockByBank(msg.sender, lockedAmount);

        emit PayBackInFull(msg.sender, _index);
    }

    // Pay back to a loan partially.
    function payBackPartially(uint256 _index, uint256 _amount) external {
        require(_index < loanList[msg.sender].length, "getTotalLoan: index out of range");
        PoolInfo storage pool = poolMap[loanList[msg.sender][_index].poolId];
        require(address(pool.calculator) != address(0), "no calculator");

        uint256 loanId = loanList[msg.sender][_index].loanId;
        uint256 lockedAmount = pool.calculator.getLoanLockedAmount(loanId);
        uint256 principal = pool.calculator.getLoanPrincipal(loanId);
        uint256 interest = pool.calculator.getLoanInterest(loanId);

        require(_amount <= principal + interest, "Paid too much");

        uint256 paidPrincipal = _amount.mul(principal).div(principal + interest);
        uint256 paidInterest = _amount.sub(paidPrincipal);

        // Burn principal.
        pool.itoken.burnFrom(msg.sender, paidPrincipal);

        // Transfer interest to ifaRevenue, which settled with IFA
        uint256 paidIFAAmount = paidInterest.mul(getIFAToiTokenRate(address(pool.itoken))).div(100);
        IERC20(ifaMaster.ifa()).transferFrom(msg.sender, ifaMaster.revenue(), paidIFAAmount);

        // Recalculate.
        uint256 amountToUnlock = pool.calculator.payBackPartially(loanId, paidPrincipal);
        // Unlocks in vault.
        pool.vault.unlockByBank(msg.sender, amountToUnlock);

        emit PayBackPartially(msg.sender, _index, _amount);
    }


    // Collect debt if someone defaults. Collector keeps half of the profit.
    function collectDebt(uint256 _poolId, uint256 _loanId) external {
        PoolInfo storage pool = poolMap[_poolId];
        require(address(pool.calculator) != address(0), "no calculator");

        address loanCreator = pool.calculator.getLoanCreator(_loanId);
        uint256 principal = pool.calculator.getLoanPrincipal(_loanId);
        uint256 interest = pool.calculator.getLoanInterest(_loanId);
        uint256 extra = pool.calculator.getLoanExtra(_loanId);
        uint256 lockedAmount = pool.calculator.getLoanLockedAmount(_loanId);

        // Pay principal + interest + extra.
        // Burn principal.
        pool.itoken.burnFrom(msg.sender, principal);

        // Transfer interest and extra to ifaRevenue, which settled with IFA
        uint256 payIFAAmount = (interest + extra).mul(getIFAToiTokenRate(address(pool.itoken))).div(100);
        IERC20(ifaMaster.ifa()).transferFrom(msg.sender, ifaMaster.revenue(), payIFAAmount);

        // Clear the loan.
        pool.calculator.collectDebt(_loanId);
        // Unlocks in vault.
        pool.vault.unlockByBank(loanCreator, lockedAmount);

        pool.vault.transferByBank(loanCreator, msg.sender, lockedAmount);

        emit CollectDebt(msg.sender, _poolId, _loanId);
    }
}