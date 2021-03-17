// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../tokens/IFAToken.sol";
import "./IStrategy.sol";
import "../IFAMaster.sol";

// This contract has the power to change IFA allocation among
// different pools, but can't mint more than 23,040,000 IFA tokens.
// With ALL_BLOCKS_AMOUNT and IFA_PER_BLOCK,

// Currently this contract is the only owner of IFAToken and is itself owned by Timelock

contract CreateIFA is IStrategy, Ownable {
    using SafeMath for uint256;

    uint256 public constant ALL_BLOCKS_AMOUNT = 1050000; // 3 s/block in heco and bsc. about 36 days
    uint256 public constant IFA_PER_BLOCK = 6 * 1e18; // 8 IFA per block, 8 * 1e18,
    uint256 constant PER_SHARE_SIZE = 1e12;

    // Info of each pool.
    struct PoolInfo {
        uint256 allocPoint;       // How many allocation points assigned to this pool. IFAs to distribute per block.
        uint256 lastRewardBlock;  // Last block number that IFAs distribution occurs.
    }

    // Info of each pool.
    mapping(address => PoolInfo) public poolMap;  // By vault address.
    // pool length
    mapping(uint256 => address) public vaultMap;
    uint256 public poolLength;

    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;

    // The first block.
    uint256 public startBlock;

    // startBlock + ALL_BLOCKS_AMOUNT
    uint256 public endBlock;

    // The IFA Pool.
    IFAMaster public ifaMaster;

    mapping(address => uint256) private valuePerShare;  // By vault.

    constructor(
        IFAMaster _ifaMaster
    ) public {
        ifaMaster = _ifaMaster;

        // Approve all.
        IERC20(ifaMaster.ifa()).approve(ifaMaster.pool(), type(uint256).max);
    }

    // Admin calls this function.
    function setPoolInfo(
        uint256 _poolId,
        address _vault,
        IERC20 _token,
        uint256 _allocPoint,
        bool _withUpdate
    ) external onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }

        if (_poolId >= poolLength) {
            poolLength = _poolId + 1;
        }

        vaultMap[_poolId] = _vault;

        totalAllocPoint = totalAllocPoint.sub(poolMap[_vault].allocPoint).add(_allocPoint);
        poolMap[_vault].allocPoint = _allocPoint;

        _token.approve(ifaMaster.pool(), type(uint256).max);
    }

    // Admin calls this function.
    function approve(IERC20 _token) external override onlyOwner {
        _token.approve(ifaMaster.pool(), type(uint256).max);
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
        if (_to > endBlock) {
            _to = endBlock;
        }

        if (_from >= _to) {
            return 0;
        }
        return _to.sub(_from);
    }

    function getValuePerShare(address _vault) external view override returns (uint256) {
        return valuePerShare[_vault];
    }

        function pendingValuePerShare(address _vault) external view override returns (uint256) {
        PoolInfo storage pool = poolMap[_vault];

        uint256 amountInVault = IERC20(_vault).totalSupply();
        if (block.number > pool.lastRewardBlock && amountInVault > 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 ifaReward = multiplier.mul(IFA_PER_BLOCK).mul(pool.allocPoint).div(totalAllocPoint);
            ifaReward = ifaReward.sub(ifaReward.div(2));
            return ifaReward.mul(PER_SHARE_SIZE).div(amountInVault);
        } else {
            return 0;
        }
    }

    // Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        for (uint256 i = 0; i < poolLength; ++i) {
            _update(vaultMap[i]);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function _update(address _vault) public {
        PoolInfo storage pool = poolMap[_vault];

        if (pool.allocPoint <= 0) {
            return;
        }

        if (pool.lastRewardBlock == 0) {
            // This is the first time that we start counting blocks.
            pool.lastRewardBlock = block.number;
        }

        if (block.number <= pool.lastRewardBlock) {
            return;
        }

        uint256 shareAmount = IERC20(_vault).totalSupply();
        if (shareAmount == 0) {
            // Only after now >= pool.startTime in IFAPool, shareAmount can be larger than 0.
            return;
        }

        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 allReward = multiplier.mul(IFA_PER_BLOCK).mul(pool.allocPoint).div(totalAllocPoint);
        // 10% goes to costco.
        IFAToken(ifaMaster.ifa()).mint(ifaMaster.costco(), allReward.div(10));

        // 90% goes to farmers.
        uint256 farmerReward = allReward.sub(allReward.div(10));
        IFAToken(ifaMaster.ifa()).mint(address(this), farmerReward);


        valuePerShare[_vault] = valuePerShare[_vault].add(farmerReward.mul(PER_SHARE_SIZE).div(shareAmount));
        pool.lastRewardBlock = block.number;
    }

    /**
     * @dev See {IStrategy-deposit}.
     */
    function deposit(address _vault, uint256 _amount) external override {
        require(ifaMaster.isVault(msg.sender), "sender not vault");

        if (startBlock == 0) {
            startBlock = block.number;
            endBlock = startBlock + ALL_BLOCKS_AMOUNT;
        }

        _update(_vault);
    }

    /**
     * @dev See {IStrategy-claim}.
     */
    function claim(address _vault) external override {
        require(ifaMaster.isVault(msg.sender), "sender not vault");

        _update(_vault);
    }

    /**
     * @dev See {IStrategy-withdraw}.
     */
    function withdraw(address _vault, uint256 _amount) external override {
        require(ifaMaster.isVault(msg.sender), "sender not vault");

        _update(_vault);
    }

    /**
     * @dev See {IStrategy-getTargetToken}.
     */
    function getTargetToken() external view override returns (address) {
        return ifaMaster.ifa();
    }

    // Community (of the future), please make sure _createMoreIFA contract is
    // safe enough to pull the trigger.
    function transferToCreateMoreIFA(address _createMoreIFA) external onlyOwner {
        require(block.number > endBlock);
        IFAToken(ifaMaster.ifa()).transferOwnership(_createMoreIFA);
    }

}
