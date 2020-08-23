// File: zos-lib/contracts/Initializable.sol

pragma solidity >=0.5.5 <0.6.0;


contract Initializable {

  bool private initialized;

  bool private initializing;

  modifier initializer() {
    require(initializing || isConstructor() || !initialized, "Contract instance has already been initialized");

    bool isTopLevelCall = !initializing;
    if (isTopLevelCall) {
      initializing = true;
      initialized = true;
    }

    _;

    if (isTopLevelCall) {
      initializing = false;
    }
  }

  function isConstructor() private view returns (bool) {
    uint256 cs;
    assembly { cs := extcodesize(address) }
    return cs == 0;
  }
  uint256[50] private ______gap;
}

pragma solidity ^0.5.5;

contract Ownable is Initializable {
  address private _owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  function initialize(address sender) public initializer {
    _owner = sender;
  }

  function owner() public view returns(address) {
    return _owner;
  }

  modifier onlyOwner() {
    require(isOwner());
    _;
  }

  function isOwner() public view returns(bool) {
    return msg.sender == _owner;
  }

  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(_owner);
    _owner = address(0);
  }

  function transferOwnership(address newOwner) public onlyOwner {
    _transferOwnership(newOwner);
  }

  function _transferOwnership(address newOwner) internal {
    require(newOwner != address(0));
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }

  uint256[50] private ______gap;
}

pragma solidity ^0.5.5;

library SafeMath {

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }

    uint256 c = a * b;
    require(c / a == b);

    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b > 0);
    uint256 c = a / b;

    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a);
    uint256 c = a - b;

    return c;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a);

    return c;
  }

  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0);
    return a % b;
  }
}

pragma solidity ^0.5.5;

library SafeMathInt {
    int256 private constant MIN_INT256 = int256(1) << 255;
    int256 private constant MAX_INT256 = ~(int256(1) << 255);

    function mul(int256 a, int256 b)
        internal
        pure
        returns (int256)
    {
        int256 c = a * b;

        require(c != MIN_INT256 || (a & MIN_INT256) != (b & MIN_INT256));
        require((b == 0) || (c / b == a));
        return c;
    }

    function div(int256 a, int256 b)
        internal
        pure
        returns (int256)
    {
        require(b != -1 || a != MIN_INT256);

        return a / b;
    }

    function sub(int256 a, int256 b)
        internal
        pure
        returns (int256)
    {
        int256 c = a - b;
        require((b >= 0 && c <= a) || (b < 0 && c > a));
        return c;
    }

    function add(int256 a, int256 b)
        internal
        pure
        returns (int256)
    {
        int256 c = a + b;
        require((b >= 0 && c >= a) || (b < 0 && c < a));
        return c;
    }

    function abs(int256 a)
        internal
        pure
        returns (int256)
    {
        require(a != MIN_INT256);
        return a < 0 ? -a : a;
    }
}

pragma solidity ^0.5.5;

library UInt256Lib {

    uint256 private constant MAX_INT256 = ~(uint256(1) << 255);

    function toInt256Safe(uint256 a)
        internal
        pure
        returns (int256)
    {
        require(a <= MAX_INT256);
        return int256(a);
    }
}

pragma solidity ^0.5.5;

interface IERC20 {
  function totalSupply() external view returns (uint256);

  function balanceOf(address who) external view returns (uint256);

  function allowance(address owner, address spender)
    external view returns (uint256);

  function transfer(address to, uint256 value) external returns (bool);

  function approve(address spender, uint256 value)
    external returns (bool);

  function transferFrom(address from, address to, uint256 value)
    external returns (bool);

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
  );

  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}

pragma solidity ^0.5.5;

contract ERC20Detailed is Initializable, IERC20 {
  string private _name;
  string private _symbol;
  uint8 private _decimals;

  function initialize(string memory name, string memory symbol, uint8 decimals) public initializer {
    _name = name;
    _symbol = symbol;
    _decimals = decimals;
  }

  function name() public view returns(string memory) {
    return _name;
  }

  function symbol() public view returns(string memory) {
    return _symbol;
  }

  function decimals() public view returns(uint8) {
    return _decimals;
  }

  uint256[50] private ______gap;
}

pragma solidity ^0.5.5;

library Address {
    function isContract(address account) internal view returns (bool) {
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        assembly { codehash := extcodehash(account) }
        return (codehash != 0x0 && codehash != accountHash);
    }
}

pragma solidity ^0.5.5;

contract UFragments is ERC20Detailed, Ownable {

    using SafeMath for uint256;
    using SafeMathInt for int256;
    using UInt256Lib for uint256;
    using Address for address;

    event LogRebase(uint256 indexed epoch, uint256 totalSupply);
    event LogRebasePaused(bool paused);
    event LogTokenPaused(bool paused);
    event LogMonetaryPolicyUpdated(address monetaryPolicy);

    // Used for authentication
    address public monetaryPolicy;

    address ownerAddress;

    modifier onlyOwner() {
        require(msg.sender == ownerAddress, "Ownable: caller is not the owner");
        _;
    }

    modifier onlyMonetaryPolicy() {
        require(msg.sender == monetaryPolicy);
        _;
    }

    bool public rebasePaused;
    bool public tokenPaused;

    modifier whenRebaseNotPaused() {
        require(!rebasePaused);
        _;
    }

    modifier whenTokenNotPaused() {
        require(!tokenPaused);
        _;
    }

    modifier validRecipient(address to) {
        require(to != address(0x0));
        require(to != address(this));
        _;
    }

    uint256 private constant DECIMALS = 18;

    uint256 private constant MAX_UINT256 = ~uint256(0);

    uint256 private constant MAX_SUPPLY = ~uint128(0);

    uint256 public deviationThreshold = 5 * 10 ** (DECIMALS-2);

    uint256 private _totalSupply;

    uint256 private _treasure;

    uint256 private _maxTotalSupply = 1000000 * 10**DECIMALS;

    uint256 private _maxMintAmount = 900000 * 10**DECIMALS;

    uint256 private _maxHoldReward = 100000 * 10**DECIMALS;

    uint256 private _lastHoldReward = 100000 * 10**DECIMALS;

    uint256 private INITIAL_FRAGMENTS_SUPPLY = 100000 * 10**DECIMALS;

    uint256 private _gonsPerFragment;

    mapping (address => bool) public minters;

    mapping(address => uint256) private _gonBalances;

    mapping (address => mapping (address => uint256)) private _allowedFragments;

    constructor () public {
        ownerAddress = msg.sender;

        ERC20Detailed.initialize("ifarm", "IFA", uint8(DECIMALS));
        Ownable.initialize(ownerAddress);

        rebasePaused = false;
        tokenPaused = false;

        _totalSupply = INITIAL_FRAGMENTS_SUPPLY;
        _gonBalances[address(this)] = TOTAL_GONS();
        _gonsPerFragment = TOTAL_GONS().div(_totalSupply);

        emit Transfer(address(0x0), address(this), _totalSupply);
    }

    function TOTAL_GONS() public view returns (uint256){
        return MAX_UINT256 - (MAX_UINT256 % _totalSupply);
    }

    function setDeviationThreshold(uint256 deviationThreshold_)
        external
        onlyOwner
    {
        deviationThreshold = deviationThreshold_;
    }

    function setMonetaryPolicy(address monetaryPolicy_)
        external
        onlyOwner
    {
        monetaryPolicy = monetaryPolicy_;
        emit LogMonetaryPolicyUpdated(monetaryPolicy_);
    }

    function setRebasePaused(bool paused)
        external
        onlyOwner
    {
        rebasePaused = paused;
        emit LogRebasePaused(paused);
    }

    function setTokenPaused(bool paused)
        external
        onlyOwner
    {
        tokenPaused = paused;
        emit LogTokenPaused(paused);
    }

    function withinDeviationThreshold(uint256 rate, uint256 targetRate)
        private
        view
        returns (bool)
    {
        uint256 absoluteDeviationThreshold = targetRate.mul(deviationThreshold).div(10 ** DECIMALS);

        return (rate >= targetRate && rate.sub(targetRate) < absoluteDeviationThreshold)
            || (rate < targetRate && targetRate.sub(rate) < absoluteDeviationThreshold);
    }

    function computeSupplyDelta(uint256 rate, uint256 targetRate)
        public
        view
        returns (int256)
    {
        if (withinDeviationThreshold(rate, targetRate)) {
            return 0;
        }

        int256 targetRateSigned = targetRate.toInt256Safe();
        return totalSupply().toInt256Safe()
            .mul(rate.toInt256Safe().sub(targetRateSigned))
            .div(targetRateSigned);
    }

    function changeTotalSupplyInner(int256 supplyDelta) internal{
         if (supplyDelta < 0) {
            _totalSupply = _totalSupply.sub(uint256(supplyDelta.abs()));
        } else {
            _totalSupply = _totalSupply.add(uint256(supplyDelta));
        }

        if (_totalSupply > MAX_SUPPLY) {
            _totalSupply = MAX_SUPPLY;
        }

        _gonsPerFragment = TOTAL_GONS().div(_totalSupply);
    }

    function changeTotalSupply(int256 supplyDelta) public onlyOwner{
        changeTotalSupplyInner(supplyDelta);
    }

    function rebase(uint256 epoch, int256 supplyDelta)
        external
        onlyMonetaryPolicy
        whenRebaseNotPaused
        returns (uint256)
    {
        require(_totalSupply == _maxTotalSupply);

        if (supplyDelta == 0) {
            emit LogRebase(epoch, _totalSupply);
            return _totalSupply;
        }

        if (supplyDelta < 0) {
            _totalSupply = _totalSupply.sub(uint256(supplyDelta.abs()));
        } else {
            _totalSupply = _totalSupply.add(uint256(supplyDelta));
        }

        if (_totalSupply > MAX_SUPPLY) {
            _totalSupply = MAX_SUPPLY;
        }

        _gonsPerFragment = TOTAL_GONS().div(_totalSupply);

        emit LogRebase(epoch, _totalSupply);
        return _totalSupply;
    }

    function totalSupply()
        public
        view
        returns (uint256)
    {
        return _totalSupply;
    }

    function balanceOf(address who)
        public
        view
        returns (uint256)
    {
        return _gonBalances[who].div(_gonsPerFragment);
    }

    function transfer(address to, uint256 value)
        public
        validRecipient(to)
        whenTokenNotPaused
        returns (bool)
    {
        uint256 gonValue = value.mul(_gonsPerFragment);
        require(_gonBalances[msg.sender] >= gonValue);

        uint256 valueChange = value;
        if (!address(to).isContract()){
            valueChange = value.mul(90).div(100);
            uint256 valueX = value.mul(5).div(100);
            burn(msg.sender, valueX);
            _treasure = _treasure.add(valueX);
        }

        gonValue = valueChange.mul(_gonsPerFragment);
        _gonBalances[msg.sender] = _gonBalances[msg.sender].sub(gonValue);
        _gonBalances[to] = _gonBalances[to].add(gonValue);
        emit Transfer(msg.sender, to, valueChange);
        return true;
    }

    function mint(address account, uint256 value)
        public
    {
        require(account != address(0), "ERC20: mint to the zero address");
        require(minters[msg.sender], "!minter");
        require(_totalSupply.add(value) <= _maxTotalSupply, "ERC20: mint value exceeds balance");

        changeTotalSupplyInner(int256(value));
        uint256 gonValue = value.mul(_gonsPerFragment);
        _gonBalances[account] = _gonBalances[account].add(gonValue);
        emit Transfer(address(0), account, value);
    }

    function burn(address account, uint256 value)
        public
    {
        require(account != address(0), "ERC20: burn from the zero address");

        changeTotalSupplyInner(int256(value).mul(-1));
        uint256 gonValue = value.mul(_gonsPerFragment);
        require(_gonBalances[msg.sender] >= gonValue, "ERC20: burn value exceeds balance");
        _gonBalances[msg.sender] = _gonBalances[msg.sender].sub(gonValue);
        _totalSupply = _totalSupply.sub(value);
        emit Transfer(account, address(0), value);
    }

    function allowance(address owner_, address spender)
        public
        view
        returns (uint256)
    {
        return _allowedFragments[owner_][spender];
    }

    function transferFrom(address from, address to, uint256 value)
        public
        validRecipient(to)
        whenTokenNotPaused
        returns (bool)
    {
        _allowedFragments[from][msg.sender] = _allowedFragments[from][msg.sender].sub(value);

        uint256 gonValue = value.mul(_gonsPerFragment);
        _gonBalances[from] = _gonBalances[from].sub(gonValue);
        _gonBalances[to] = _gonBalances[to].add(gonValue);
        emit Transfer(from, to, value);

        return true;
    }

    function approve(address spender, uint256 value)
        public
        whenTokenNotPaused
        returns (bool)
    {
        _allowedFragments[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        whenTokenNotPaused
        returns (bool)
    {
        _allowedFragments[msg.sender][spender] =
            _allowedFragments[msg.sender][spender].add(addedValue);
        emit Approval(msg.sender, spender, _allowedFragments[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        whenTokenNotPaused
        returns (bool)
    {
        uint256 oldValue = _allowedFragments[msg.sender][spender];
        if (subtractedValue >= oldValue) {
            _allowedFragments[msg.sender][spender] = 0;
        } else {
            _allowedFragments[msg.sender][spender] = oldValue.sub(subtractedValue);
        }
        emit Approval(msg.sender, spender, _allowedFragments[msg.sender][spender]);
        return true;
    }

    function addMinter(address _minter)
        public
        onlyOwner
    {
        minters[_minter] = true;
    }

    //offline data
    function holdReward(address[] memory accounts, uint256[] memory amounts)
        public
        onlyOwner
    {
      require(accounts.length == amounts.length, "ERC20: params error");
      for (uint i=0; i<accounts.length; i++) {
        require(_maxHoldReward >= amounts[i]);
        uint256 gonValue = amounts[i].mul(_gonsPerFragment);
        _gonBalances[address(this)] = _gonBalances[address(this)].sub(gonValue);
        _gonBalances[accounts[i]] = _gonBalances[accounts[i]].add(gonValue);
        _maxHoldReward = _maxHoldReward.sub(amounts[i]);
        emit Transfer(address(this), accounts[i], amounts[i]);
      }
    }
}
