// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./tokens/IFAVault.sol";
import "./components/IFAPool.sol";
import "./strategies/CreateIFA.sol";

interface IERC20IFA {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function totalSupply() external view returns (uint);

    function balanceOf(address owner) external view returns (uint);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);

    function transfer(address to, uint value) external returns (bool);

    function transferFrom(address from, address to, uint value) external returns (bool);
}

// Query data related to ifa.
// This contract is owned by Timelock.
contract IFADataBoard is Ownable {
    uint256 constant K_MADE_iUSD = 0;
    uint256 constant K_MADE_iBTC = 1;
    uint256 constant K_MADE_iETH = 2;

    IFAMaster public ifaMaster;

    constructor(IFAMaster _ifaMaster) public {
        ifaMaster = _ifaMaster;
    }

    // get APY * 100
    // _LPType: 0 = X-USDT-LP, 1 = X-BTC-LP, 2 = X-ETH-LP,
    function getAPY(uint256 _poolId, address _token, bool _isLPToken, uint256 _lpType) public view returns (uint256) {
        (, IFAVault vault,) = IFAPool(ifaMaster.pool()).poolMap(_poolId);

        uint256 MK_STRATEGY_CREATE_IFA = 0;
        CreateIFA createIFA = CreateIFA(ifaMaster.strategyByKey(MK_STRATEGY_CREATE_IFA));
        (uint256 allocPoint,) = createIFA.poolMap(address(vault));
        uint256 totalAlloc = createIFA.totalAllocPoint();

        if (totalAlloc == 0) {
            return 0;
        }

        uint256 vaultSupply = vault.totalSupply();

        // 8 IFA per block
        uint256 factor = 8;

        if (vaultSupply == 0) {
            // Assume $1 is put in.
            // 28800 is the estimated daily block number of heco and bsc
            return getIFAPrice() * factor * 28800 * 100 * allocPoint / totalAlloc / 1e18;
        }

        // 10512000 is the estimated yearly block number of heco and bsc.
        // 1e18 comes from vaultSupply.
        if (_isLPToken) {
            uint256 lpPrice = 0;
            if (_lpType == 0) {
                lpPrice = getUsdtLpPrice(_token);
            }

            if (_lpType == 1) {
                lpPrice = getBtcLpPrice(_token);
            }

            if (_lpType == 2) {
                lpPrice = getEthLpPrice(_token);
            }

            if (lpPrice == 0) {
                return 0;
            }

            return getIFAPrice() * factor * 10512000 * 100 * allocPoint * 1e18 / totalAlloc / lpPrice / vaultSupply;
        } else {
            uint256 tokenPrice = getTokenPrice(_token);
            if (tokenPrice == 0) {
                return 0;
            }

            return getIFAPrice() * factor * 10512000 * 100 * allocPoint * 1e18 / totalAlloc / tokenPrice / vaultSupply;
        }
    }

    function getEthLpPrice(address _token) public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        address pairAddress = factory.getPair(_token, ifaMaster.iETH());
        if (pairAddress == address(0)){
            pairAddress = factory.getPair(_token, ifaMaster.wETH());
        }
        require(pairAddress != address(0), "LPToken - iETH or wETH Pair need set by a specified owner");

        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        (uint256 reserve0, uint256 reserve1,) = pair.getReserves();
        if (pair.token0() == _token) {
            return reserve1 * getEthPrice() * 2 / pair.totalSupply();
        } else {
            return reserve0 * getEthPrice() * 2 / pair.totalSupply();
        }
    }

    function getBtcLpPrice(address _token) public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        address pairAddress = factory.getPair(_token, ifaMaster.iBTC());
        if (pairAddress == address(0)){
            pairAddress = factory.getPair(_token, ifaMaster.wBTC());
        }
        require(pairAddress != address(0), "LPToken - iBTC or wBTC Pair need set by a specified owner");

        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        (uint256 reserve0, uint256 reserve1,) = pair.getReserves();
        if (pair.token0() == _token) {
            return reserve1 * getBtcPrice() * 2 / pair.totalSupply();
        } else {
            return reserve0 * getBtcPrice() * 2 / pair.totalSupply();
        }
    }

    function getUsdtLpPrice(address _token) public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        address pairAddress = factory.getPair(_token, ifaMaster.iUSD());
        if (pairAddress == address(0)){
            pairAddress = factory.getPair(_token, ifaMaster.usd());
        }
        require(pairAddress != address(0), "LPToken - iUSD or usd Pair need set by a specified owner");

        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        (uint256 reserve0, uint256 reserve1,) = pair.getReserves();
        uint usdDecimals = IERC20IFA(ifaMaster.usd()).decimals();
        if (pair.token0() == _token) {
            return reserve1 * (10 ** usdDecimals) * 2 / pair.totalSupply();
        } else {
            return reserve0 * (10 ** usdDecimals) * 2 / pair.totalSupply();
        }
    }

    // Return the 6 digit price of eth on uniswap.
    function getBtcPrice() public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair btcUSDTPair = IUniswapV2Pair(factory.getPair(ifaMaster.wBTC(), ifaMaster.usd()));
        require(address(btcUSDTPair) != address(0), "BTC-USDT Pair need set by a specified owner");
        (uint reserve0, uint reserve1,) = btcUSDTPair.getReserves();
        uint usdDecimals = IERC20IFA(ifaMaster.usd()).decimals();
        // USDT has 6 digits in Ethereum and WETH has 18 digits.
        // To get 6 digits after floating point, we need 1e18.

        /**
        if (ethUSDTPair.token0() == ifaMaster.wETH()) {
            return reserve1 * 1e18 / reserve0;
        } else {
            return reserve0 * 1e18 / reserve1;
        }
        */

        // USDT has 18 digits in heco. we also need return 6 digit price here
        if (btcUSDTPair.token0() == ifaMaster.wBTC()) {
            return reserve1 * (10 ** usdDecimals) / reserve0;
        } else {
            return reserve0 * (10 ** usdDecimals) / reserve1;
        }
    }

    // Return the 6 digit price of eth on uniswap.
    function getEthPrice() public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair ethUSDTPair = IUniswapV2Pair(factory.getPair(ifaMaster.wETH(), ifaMaster.usd()));
        require(address(ethUSDTPair) != address(0), "ETH-USDT Pair need set by a specified owner");
        (uint reserve0, uint reserve1,) = ethUSDTPair.getReserves();
        uint usdDecimals = IERC20IFA(ifaMaster.usd()).decimals();
        // USDT has 6 digits in Ethereum and WETH has 18 digits.
        // To get 6 digits after floating point, we need 1e18.

        /**
        if (ethUSDTPair.token0() == ifaMaster.wETH()) {
            return reserve1 * 1e18 / reserve0;
        } else {
            return reserve0 * 1e18 / reserve1;
        }
        */

        // USDT has 18 digits in heco. we also need return 6 digit price here
        if (ethUSDTPair.token0() == ifaMaster.wETH()) {
            return reserve1 * (10 ** usdDecimals) / reserve0;
        } else {
            return reserve0 * (10 ** usdDecimals) / reserve1;
        }
    }

    // Return the 18 digit price of eth on uniswap.
    function getIFAPrice() public view returns (uint256) {
        uint iusdPrice = getiUsdPrice();

        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair ifaiUSDPair = IUniswapV2Pair(factory.getPair(ifaMaster.ifa(), ifaMaster.iUSD()));
        require(address(ifaiUSDPair) != address(0), "RICE-rUSD Pair need set by a specified owner");
        (uint reserve0, uint reserve1,) = ifaiUSDPair.getReserves();
        uint iusdDecimals = IERC20IFA(ifaMaster.iUSD()).decimals();
        iusdDecimals = 10 ** iusdDecimals;

        if (ifaiUSDPair.token0() == ifaMaster.ifa()) {
            return reserve1 * iusdDecimals / reserve0 * iusdPrice / iusdDecimals;
        } else {
            return reserve0 * iusdDecimals / reserve1 * iusdPrice / iusdDecimals;
        }
    }

    // Return the 6 digit price of eth on uniswap.
    function getiUsdPrice() public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair iusdDAIPair = IUniswapV2Pair(factory.getPair(ifaMaster.iUSD(), ifaMaster.dai()));
        require(address(iusdDAIPair) != address(0), "rUSD-USDT Pair need set by a specified owner");
        (uint reserve0, uint reserve1,) = iusdDAIPair.getReserves();
        uint daiDecimals = IERC20IFA(ifaMaster.dai()).decimals();

        if (iusdDAIPair.token0() == ifaMaster.iUSD()) {
            return reserve1 * (10 ** daiDecimals) / reserve0;
        } else {
            return reserve0 * (10 ** daiDecimals) / reserve1;
        }
    }

    // Return the 6 digit price of eth on uniswap.
    function getiBtcPrice() public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair ibtcWBTCPair = IUniswapV2Pair(factory.getPair(ifaMaster.iBTC(), ifaMaster.wBTC()));
        require(address(ibtcWBTCPair) != address(0), "rBTC-WBTC Pair need set by a specified owner");
        (uint reserve0, uint reserve1,) = ibtcWBTCPair.getReserves();
        uint wBTCDecimals = IERC20IFA(ifaMaster.wBTC()).decimals();

        if (ibtcWBTCPair.token0() == ifaMaster.iBTC()) {
            return getBtcPrice() * reserve1 / reserve0;
        } else {
            return getBtcPrice() * reserve0 / reserve1;
        }
    }

    // Return the 6 digit price of eth on uniswap.
    function getiEthPrice() public view returns (uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair iethWETHPair = IUniswapV2Pair(factory.getPair(ifaMaster.iETH(), ifaMaster.wETH()));
        require(address(iethWETHPair) != address(0), "rETH-WETH Pair need set by a specified owner");
        (uint reserve0, uint reserve1,) = iethWETHPair.getReserves();
        uint wETHDecimals = IERC20IFA(ifaMaster.wETH()).decimals();

        if (iethWETHPair.token0() == ifaMaster.iETH()) {
            return getEthPrice() * reserve1 / reserve0;
        } else {
            return getEthPrice() * reserve0 / reserve1;
        }
    }


    //
    //K_MADE_iUSD = 0;
    //K_MADE_iBTC = 1;
    //K_MADE_iETH = 2;

    // Return the 6 digit price of ifa on uniswap.
    function getTokenPrice(address _token) public view returns (uint256) {
        if (_token == ifaMaster.iUSD()) {
            return getiUsdPrice();
        }
        if (_token == ifaMaster.iBTC()) {
            return getiBtcPrice();
        }
        if (_token == ifaMaster.iETH()) {
            return getiEthPrice();
        }
        if(_token == ifaMaster.wETH()){
            return getEthPrice();
        }
        if(_token == ifaMaster.ifa()){
            return getIFAPrice();
        }
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair tokenWETHPair = IUniswapV2Pair(factory.getPair(_token, ifaMaster.wETH()));
        require(address(tokenWETHPair) != address(0), "token-WETH Pair need set by a specified owner");
        (uint reserve0, uint reserve1,) = tokenWETHPair.getReserves();
        uint wETHDecimals = IERC20IFA(ifaMaster.wETH()).decimals();

        if (tokenWETHPair.token0() == ifaMaster.wETH()) {
            return getEthPrice() * reserve0 / reserve1;
        } else {
            return getEthPrice() * reserve1 / reserve0;
        }
        // should not happen
        return uint256(-1);
    }
}

