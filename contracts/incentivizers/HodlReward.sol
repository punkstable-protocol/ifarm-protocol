
pragma solidity ^0.5.0;


library Math {

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a / 2) + (b / 2) + ((a % 2 + b % 2) / 2);
    }
}

pragma solidity ^0.5.0;

library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

pragma solidity ^0.5.0;

interface IERC20 {

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function mint(address account, uint amount) external;

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

pragma solidity ^0.5.5;

library Address {

    function isContract(address account) internal view returns (bool) {
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        // solhint-disable-next-line no-inline-assembly
        assembly { codehash := extcodehash(account) }
        return (codehash != 0x0 && codehash != accountHash);
    }

    function toPayable(address account) internal pure returns (address payable) {
        return address(uint160(account));
    }

    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-call-value
        (bool success, ) = recipient.call.value(amount)("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }
}


pragma solidity ^0.5.0;

contract LPTokenWrapper {

    using SafeMath for uint256;

    IERC20 public stakeToken = IERC20(0x5A9d3E3869D8Df2B1dfae8B2178801044B58fA36);

    uint256 private _totalSupply;

    mapping(address => uint256) private _balances;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stake(uint256 amount) public {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        require(stakeToken.transferFrom(msg.sender, address(this), amount), "stakeToken transferFrom failed");
    }

    function withdraw(uint256 amount) public {
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        require(stakeToken.transfer(msg.sender, amount), "stakeToken transfer failed");
    }

}

pragma solidity ^0.5.0;

contract IFARewards is LPTokenWrapper {

    IERC20 public IFA = IERC20(0xf4B5B753554B49471f0f0c68fD9bcd7B28BD6d08);

    uint256 public constant DURATION = 7 days;

    uint256 public initreward = 10000*1e18;

    uint256 private mintIFAAmount = 0;

    uint256 public periodFinish = 0;

    uint256 public rewardRate = 0;

    uint256 public lastUpdateTime;

    uint256 public rewardPerTokenStored;

    uint256 public tokenValue;

    //mapping(address => uint256) public userRewardPerTokenPaid;

    mapping(address => uint256) public userStakeTime;

    mapping(address => uint256) public rewards;

    event RewardAdded(uint256 reward);

    event Staked(address indexed user, uint256 amount);

    event Withdrawn(address indexed user, uint256 amount);

    event RewardPaid(address indexed user, uint256 reward);

    address rewardDistribution;

    event SetRewardDistribution(address indexed rewardDistribution, address indexed _rewardDistribution);

    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor () public {
        rewardDistribution = msg.sender;
        emit SetRewardDistribution(address(0), rewardDistribution);

        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }


    modifier onlyRewardDistribution() {
        require(msg.sender == rewardDistribution, "Caller is not reward distribution");
        _;
    }

    function setRewardDistribution(address _rewardDistribution)
        external
        onlyOwner
    {
        emit SetRewardDistribution(rewardDistribution, _rewardDistribution);
        rewardDistribution = _rewardDistribution;
    }

    function setTokenValue(uint256 _tokenValue){
        tokenValue = _tokenValue;
    }

    modifier updateReward(address account) {
        //rewardPerTokenStored = rewardPerToken(account);
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            //userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    /**
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }
    */

    function rewardPerToken(address account) public view returns (uint256) {
        if (totalSupply() == 0) {
            return 0;
        }
        uint256 stakeTime = userStakeTime[account];
        if (stakeTime == 0) {
            stakeTime = block.timestamp;
        }
        uint256 stakeTimeLast = (block.timestamp).sub(stakeTime);
        uint256 stakeAmount = balanceOf(account);

        uint256 mintRate = mintIFAAmount.mul(100).div(initreward);
        if (mintRate<25)
            mintRate = 25;
        else if (mintRate > 75)
            mintRate = 75;
        uint256 timeRate = 100 - mintRate;
        //[(A*SV+ 0.33/(Token Value)*BT*TW] *(rewardRate)*Decimal]/totalSupply
        return (stakeAmount.mul(mintRate).div(100).mul(rewardRate).mul(1e18)).add((rewardRate).mul(1e18).mul(33).div(100).div(tokenValue).mul(timeRate).div(100).mul(stakeTimeLast)).div(totalSupply());
    }

    function stakeTimeLast(address account) public view returns (uint256) {
        uint256 stakeTime = userStakeTime[account];
        if (stakeTime == 0) {
            stakeTime = block.timestamp;
        }
         return (block.timestamp).sub(stakeTime);
    }

    function earned(address account) public view returns (uint256) {
        return
            balanceOf(account)
                .mul(rewardPerToken(account))
                .div(1e18)
                .add(rewards[account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 amount) public updateReward(msg.sender) checkhalve checkStart{
        require(amount > 0, "Cannot stake 0");
        super.stake(amount);
        emit Staked(msg.sender, amount);
        if (userStakeTime[msg.sender] == 0) {
            userStakeTime[msg.sender] = block.timestamp;
        }
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) checkStart{
        require(amount > 0, "Cannot withdraw 0");
        super.withdraw(amount);
        emit Withdrawn(msg.sender, amount);
        if (balanceOf(msg.sender) > 0) {
            userStakeTime[msg.sender] = block.timestamp;
        } else {
            userStakeTime[msg.sender] = 0;
        }
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
        getReward();
    }

    function getReward() public updateReward(msg.sender) checkhalve checkStart{
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(IFA.transfer(msg.sender, reward), "getReward transfer IFA failed");
            emit RewardPaid(msg.sender, reward);
            mintIFAAmount = mintIFAAmount.add(reward);
        }
    }

    modifier checkhalve(){
        if (block.timestamp >= periodFinish) {
            initreward = initreward.mul(50).div(100);
            IFA.mint(address(this),initreward);

            rewardRate = initreward.div(DURATION);
            periodFinish = block.timestamp.add(DURATION);
            emit RewardAdded(initreward);
        }
        _;
    }

    modifier checkStart(){
        //require(block.timestamp > starttime,"not start");
        _;
    }

    function notifyRewardAmount(uint256 reward, uint256 _tokenValue)
        external
        onlyRewardDistribution
        updateReward(address(0))
    {
        emit RewardAdded(block.timestamp);
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(DURATION);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(DURATION);
        }
        tokenValue = _tokenValue;
        IFA.mint(address(this),reward);
        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(DURATION);
        emit RewardAdded(reward);
    }

}
