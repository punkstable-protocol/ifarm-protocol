// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";

/*

Here we have a list of constants. In order to get access to an address
managed by IFAMaster, the calling contract should copy and define
some of these constants and use them as keys.

Keys themselves are immutable. Addresses can be immutable or mutable.

a) Vault addresses are immutable once set, and the list may grow:

K_VAULT_BIRR_CASTLE = 0;
K_VAULT_SUNNYLANDS = 1;
K_VAULT_CHATEAU_LAFITTE = 2;
K_VAULT_ADARE_MANOR = 3;
K_VAULT_VILLA_DESTE = 4;
K_VAULT_VILLA_LANT = 5;
K_VAULT_VILLA_FARNESE = 6;
K_VAULT_CHATSWORTH_HOUSE = 7;
K_VAULT_CHATEAU_MARGAUX = 8;

b) Elastic token addresses are immutable once set, and the list may grow:
K_MADE_iUSD = 0;
K_MADE_iBTC = 1;
K_MADE_iETH = 2;


c) Strategy addresses are mutable:
K_STRATEGY_CREATE_IFA = 0;
K_STRATEGY_SHARE_REVENUE = 1;

d) Calculator addresses are mutable:
K_CALCULATOR_DAI = 0;
K_CALCULATOR_wBTC = 1;
K_CALCULATOR_wETH = 2;


Solidity doesn't allow me to define global constants, so please
always make sure the key name and key value are copied as the same
in different contracts.

*/


// IFAMaster manages the addresses all the other contracts of the system.
// This contract is owned by Timelock.
contract IFAMaster is Ownable {

    address public pool;
    address public bank;
    address public revenue;
    address public costco;

    address public ifa;
    address public dai;
    address public wBTC;
    address public wETH;
    address public usd;

    address public uniswapV2Factory;

    mapping(address => bool) public isVault;
    mapping(uint256 => address) public vaultByKey;

    mapping(address => uint256) public iTokenKey;

    mapping(address => bool) public isStrategy;
    mapping(uint256 => address) public strategyByKey;

    mapping(address => bool) public isCalculator;
    mapping(uint256 => address) public calculatorByKey;

    // Immutable once set.
    function setPool(address _pool) external onlyOwner {
        require(pool == address(0));
        pool = _pool;
    }

    // Immutable once set.
    // Bank owns all the iTokens tokens.
    function setBank(address _bank) external onlyOwner {
        require(bank == address(0));
        bank = _bank;
    }

    // Mutable in case we want to upgrade this module.
    function setRevenue(address _revenue) external onlyOwner {
        revenue = _revenue;
    }

    // Mutable in case we want to upgrade this module.
    function setCostco(address _costco) external onlyOwner {
        costco = _costco;
    }

    // Mutable, in case Uniswap has changed or we want to switch to sushi.
    // The core systems, Pool and Bank, don't rely on Uniswap, so there is no risk.
    function setUniswapV2Factory(address _uniswapV2Factory) external onlyOwner {
        uniswapV2Factory = _uniswapV2Factory;
    }

    // Immutable once set.
    function setDAI(address _dai) external onlyOwner {
        require(dai == address(0));
        dai = _dai;
    }

    // Immutable once set.
    function setwBTC(address _wBTC) external onlyOwner {
        require(wBTC == address(0));
        wBTC = _wBTC;
    }

    // Immutable once set.
    function setwETH(address _wETH) external onlyOwner {
        require(wETH == address(0));
        wETH = _wETH;
    }

    // Mutable in case we want to update USD Coins. but we will set USDT firstly and hopefully Tether is reliable.
    // Even if it fails, not a big deal, we only used USDT to estimate APY.
    function setUSD(address _usd) external onlyOwner {
        usd = _usd;
    }

    // Immutable once set.
    function setIFA(address _ifa) external onlyOwner {
        require(ifa == address(0));
        ifa = _ifa;
    }

    // Immutable once added, and you can always add more.
    function setiToken(uint256 _key, address _itoken) external onlyOwner {
        require(_itoken != address(0), "error iToken address");
        iTokenKey[_itoken] = _key;
    }

    // Immutable once added, and you can always add more.
    function addVault(uint256 _key, address _vault) external onlyOwner {
        require(vaultByKey[_key] == address(0), "vault: key is taken");

        isVault[_vault] = true;
        vaultByKey[_key] = _vault;
    }

    // Mutable and removable.
    function addStrategy(uint256 _key, address _strategy) external onlyOwner {
        isStrategy[_strategy] = true;
        strategyByKey[_key] = _strategy;
    }

    function removeStrategy(uint256 _key) external onlyOwner {
        isStrategy[strategyByKey[_key]] = false;
        delete strategyByKey[_key];
    }

    // Mutable and removable.
    function addCalculator(uint256 _key, address _calculator) external onlyOwner {
        isCalculator[_calculator] = true;
        calculatorByKey[_key] = _calculator;
    }

    function removeCalculator(uint256 _key) external onlyOwner {
        isCalculator[calculatorByKey[_key]] = false;
        delete calculatorByKey[_key];
    }
}
