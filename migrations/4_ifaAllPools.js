// ============ Contracts ============
// tools
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");
const { getDeployedContract } = require("./config/contract_address")

// public
const MockERC20 = artifacts.require('MockERC20');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const IFARevenue = artifacts.require('IFARevenue');
const CreateIFA = artifacts.require('CreateIFA');
const ShareRevenue = artifacts.require('ShareRevenue')

// IFA
const IFAToken = artifacts.require('IFAToken');

// deploy 3
const BasicCalculator = artifacts.require('BasicCalculator')

// all pool vaults,total:9
const BirrCastle = artifacts.require('BirrCastle');
const Sunnylands = artifacts.require('Sunnylands');
const ChateauLafitte = artifacts.require('ChateauLafitte');
const AdareManor = artifacts.require('AdareManor');
const VillaDEste = artifacts.require('VillaDEste');
const VillaLant = artifacts.require('VillaLant');
const VillaFarnese = artifacts.require('VillaFarnese');
const ChatsworthHouse = artifacts.require('ChatsworthHouse');
const ChateauMargaux = artifacts.require('ChateauMargaux');

// load deployed contract address
const DeployedContract = getDeployedContract()

// Contract address
const uniswapsAddress = {
    'uniswapV2Factory': DeployedContract.uniswapsAddress.uniswapV2Factory,
    'uniswapV2Router': DeployedContract.uniswapsAddress.uniswapV2Router,
}

const itokensAddress = {
    'iETH': DeployedContract.itokensAddress.iETH,
    'iBTC': DeployedContract.itokensAddress.iBTC,
    'iUSD': DeployedContract.itokensAddress.iUSD,
}

let tokensAddress = {
    'DAI': DeployedContract.tokensAddress.DAI,
    'wBTC': DeployedContract.tokensAddress.wBTC,
    'wETH': DeployedContract.tokensAddress.wETH,
    'IFA': DeployedContract.tokensAddress.IFA,
    'USD': DeployedContract.tokensAddress.USD,
}

let lpTokenAddress = {
    "iUSD_DAI": DeployedContract.lpTokenAddress.iUSD_DAI,
    "iBTC_wBTC": DeployedContract.lpTokenAddress.iBTC_wBTC,
    "iETH_ETH": DeployedContract.lpTokenAddress.iETH_ETH,
    "IFA_DAI": DeployedContract.lpTokenAddress.IFA_DAI,
    "IFA_wBTC": DeployedContract.lpTokenAddress.IFA_wBTC,
    "IFA_ETH": DeployedContract.lpTokenAddress.IFA_ETH,
}

let publicContractAddress = {
    'IFAMaster': '',
    'IFAPool': '',
    'IFABank': '',
    'IFARevenue': '',
    'Costco': '',
    'IFADataBoard': '',
    'CreateIFA': '',
    'ShareRevenue': '',
}

let calculatorsAddress = {
}

let poolVaultName = [
    'BirrCastle',
    'Sunnylands',
    'ChateauLafitte',
    'AdareManor',
    'VillaDEste',
    'VillaLant',
    'VillaFarnese',
    'ChatsworthHouse',
    'ChateauMargaux',
]

let poolVaultContractAddress = {
    'BirrCastle': '',
    'Sunnylands': '',
    'ChateauLafitte': '',
    'AdareManor': '',
    'VillaDEste': '',
    'VillaLant': '',
    'VillaFarnese': '',
    'ChatsworthHouse': '',
    'ChateauMargaux': '',
}

const addressItem = {
    'uniswap': uniswapsAddress,
    'itokensAddress': itokensAddress,
    'tokensAddress': tokensAddress,
    'lpTokenAddress': lpTokenAddress,
    'public': publicContractAddress,
    'poolVaults': poolVaultContractAddress,
    'calculatorsAddress': calculatorsAddress,
}

// Elastic token addresses are immutable once set, and the list may grow:
const K_MADE_iUSD = 0;
const K_MADE_iBTC = 1;
const K_MADE_iETH = 2;

// Strategy addresses are mutable:
// seed token pool use
const K_STRATEGY_CREATE_IFA = 0;
// seed lp token pool use
const K_STRATEGY_SHARE_REVENUE = 1;

// Calculator addresses are mutable ( borrow use )
const K_CALCULATOR_DAI = 0;
const K_CALCULATOR_wBTC = 1;
const K_CALCULATOR_wETH = 2;


// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    await Promise.all([
        await mockTokens(accounts),
        await deployPublic(deployer, network, accounts),
        await deployBorrowPools(deployer, network, accounts),
        await deployLpTokenPools(deployer, network, accounts),
    ]);
    console.log(JSON.stringify(addressItem));
};

module.exports = migration;

// tools functions
async function mockTokenTool(_tokenJson, _tokenName, _account) {
    let totalSupply = ether('900000000');
    if (_tokenJson.hasOwnProperty(_tokenName) && _tokenJson[_tokenName].length == 0) {
        return await MockERC20.new(`Fake Wrapped ${_tokenName}`, `${_tokenName}`, totalSupply, { from: _account });
    }
    return await MockERC20.at(_tokenJson[_tokenName]);
}


// ============ Deploy Functions ============
// Used during demonstration, not used during official release

async function mockTokens(accounts) {
    let _dai = await mockTokenTool(tokensAddress, 'DAI', accounts[0]);
    let _wbtc = await mockTokenTool(tokensAddress, 'wBTC', accounts[0]);
    let _weth = await mockTokenTool(tokensAddress, 'wETH', accounts[0]);
    let _usd = await mockTokenTool(tokensAddress, 'USD', accounts[0]);
    let _iUSD_DAI = await mockTokenTool(lpTokenAddress, 'iUSD_DAI', accounts[0]);
    let _iBTC_wBTC = await mockTokenTool(lpTokenAddress, 'iBTC_wBTC', accounts[0]);
    let _iETH_ETH = await mockTokenTool(lpTokenAddress, 'iETH_ETH', accounts[0]);
    let _IFA_DAI = await mockTokenTool(lpTokenAddress, 'IFA_DAI', accounts[0]);
    let _IFA_wBTC = await mockTokenTool(lpTokenAddress, 'IFA_wBTC', accounts[0]);
    let _IFA_ETH = await mockTokenTool(lpTokenAddress, 'IFA_ETH', accounts[0]);
    tokensAddress.DAI = _dai.address;
    tokensAddress.wBTC = _wbtc.address;
    tokensAddress.wETH = _weth.address;
    tokensAddress.USD = _usd.address;
    lpTokenAddress.iUSD_DAI = _iUSD_DAI.address;
    lpTokenAddress.iBTC_wBTC = _iBTC_wBTC.address;
    lpTokenAddress.iETH_ETH = _iETH_ETH.address;
    lpTokenAddress.IFA_DAI = _IFA_DAI.address;
    lpTokenAddress.IFA_wBTC = _IFA_wBTC.address;
    lpTokenAddress.IFA_ETH = _IFA_ETH.address;
}

async function deployPublic(deployer, network, accounts) {
    let ifaMasterInstance = await IFAMaster.new();
    let ifaPoolInstance = await IFAPool.new();
    let ifaInstance = tokensAddress.IFA.length == 0 ? await IFAToken.new() : await IFAToken.at(tokensAddress.IFA);
    await ifaMasterInstance.setIFA(ifaInstance.address);
    await ifaMasterInstance.setPool(ifaPoolInstance.address);
    let costcoInstance = await Costco.new(ifaMasterInstance.address);
    let ifaDataBoardInstance = await IFADataBoard.new(ifaMasterInstance.address);
    let ifaRevenueInstance = await IFARevenue.new(ifaMasterInstance.address);
    let createIFAInstance = await CreateIFA.new(ifaMasterInstance.address);
    let ifaBankInstance = await IFABank.new(ifaMasterInstance.address);
    let shareRevenueInstance = await ShareRevenue.new(ifaMasterInstance.address);
    await ifaMasterInstance.setiToken(K_MADE_iUSD, itokensAddress.iUSD);
    await ifaMasterInstance.setiToken(K_MADE_iBTC, itokensAddress.iBTC);
    await ifaMasterInstance.setiToken(K_MADE_iETH, itokensAddress.iETH);
    await ifaMasterInstance.setDAI(tokensAddress.DAI);
    await ifaMasterInstance.setwBTC(tokensAddress.wBTC);
    await ifaMasterInstance.setwETH(tokensAddress.wETH);
    await ifaMasterInstance.setUSD(tokensAddress.USD);
    await ifaMasterInstance.setCostco(costcoInstance.address);
    await ifaMasterInstance.setRevenue(ifaRevenueInstance.address);
    await ifaMasterInstance.setBank(ifaBankInstance.address);
    await ifaMasterInstance.addStrategy(K_STRATEGY_CREATE_IFA, createIFAInstance.address);
    await ifaMasterInstance.addStrategy(K_STRATEGY_SHARE_REVENUE, shareRevenueInstance.address);
    await ifaInstance.addMinter(createIFAInstance.address);
    let itokenContract = [
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.iUSD),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.iBTC),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.iETH),
    ]
    for (let i = 0; itokenContract.length < i; i++) {
        await itokenContract[i].methods._setBanker(ifaBankInstance.address).send({ from: accounts[0] });
    }
    publicContractAddress.IFAMaster = ifaMasterInstance.address;
    publicContractAddress.IFAPool = ifaPoolInstance.address;
    publicContractAddress.Costco = costcoInstance.address;
    publicContractAddress.IFADataBoard = ifaDataBoardInstance.address;
    publicContractAddress.IFARevenue = ifaRevenueInstance.address;
    publicContractAddress.CreateIFA = createIFAInstance.address;
    publicContractAddress.IFABank = ifaBankInstance.address;
    publicContractAddress.ShareRevenue = shareRevenueInstance.address;
    tokensAddress.IFA = ifaInstance.address;
}


// depoly borrow pools total:3
async function deployBorrowPools(deployer, network, accounts) {
    let vaults = [BirrCastle, Sunnylands, ChateauLafitte];
    let K_CALCULATORS = [K_CALCULATOR_DAI, K_CALCULATOR_wBTC, K_CALCULATOR_wETH];
    let itokenAddress = [itokensAddress.iUSD, itokensAddress.iBTC, itokensAddress.iETH];
    let tokenAddress = [tokensAddress.DAI, tokensAddress.wBTC, tokensAddress.wETH];
    let ifaMasterInstance = await IFAMaster.at(publicContractAddress.IFAMaster);
    let ifaBankInstance = await IFABank.at(publicContractAddress.IFABank);
    let ifaPoolInstance = await IFAPool.at(publicContractAddress.IFAPool);
    let createIFAInstance = await CreateIFA.at(publicContractAddress.CreateIFA);
    // let ifaInstance = await IFAToken.at(tokenAddress.IFA);
    for (let i = 0; i < vaults.length; i++) {
        let poolId = i;
        let K_CALCULATOR = K_CALCULATORS[i];
        let kVault = i
        let vault = vaults[kVault];
        let now = Math.floor((new Date()).getTime() / 1000 - 3600);
        let vaultInstance = await vault.new(ifaMasterInstance.address, publicContractAddress.CreateIFA);
        let name = await vaultInstance.name();
        poolVaultContractAddress[poolVaultName[i]] = vaultInstance.address;
        let basicCalculator = await BasicCalculator.new(ifaMasterInstance.address, 500, 70, 90, 200000)
        calculatorsAddress[`${poolVaultName[i]}Calculators`] = basicCalculator.address;
        await ifaMasterInstance.addVault(kVault, vaultInstance.address);
        await ifaMasterInstance.setUniswapV2Factory(uniswapsAddress.uniswapV2Factory);
        await ifaMasterInstance.addCalculator(K_CALCULATOR, basicCalculator.address);
        await ifaBankInstance.setPoolInfo(poolId, itokenAddress[i], vaultInstance.address, basicCalculator.address);
        await ifaPoolInstance.setPoolInfo(poolId, tokenAddress[i], vaultInstance.address, now);
        await createIFAInstance.setPoolInfo(poolId, vaultInstance.address, tokenAddress[i], 100, false);
    }
}

// depoly lp token pools total:6
async function deployLpTokenPools(deployer, network, accounts) {
    let vaults = [
        AdareManor,
        VillaDEste,
        VillaLant,
        VillaFarnese,
        ChatsworthHouse,
        ChateauMargaux
    ];
    let lpToken = [
        lpTokenAddress.iUSD_DAI,
        lpTokenAddress.iBTC_wBTC,
        lpTokenAddress.iETH_ETH,
        lpTokenAddress.IFA_DAI,
        lpTokenAddress.IFA_wBTC,
        lpTokenAddress.IFA_ETH
    ];
    let ifaMasterInstance = await IFAMaster.at(publicContractAddress.IFAMaster);
    let ifaPoolInstance = await IFAPool.at(publicContractAddress.IFAPool);
    let createIFAInstance = await CreateIFA.at(publicContractAddress.CreateIFA);
    let allocPoint = 100;
    for (let i = 3; i < vaults.length + 3; i++) {
        let poolId = i;
        let kVault = i
        let vault = vaults[kVault - 3];
        let now = Math.floor((new Date()).getTime() / 1000 - 3600);
        let vaultInstance = await vault.new(ifaMasterInstance.address, publicContractAddress.CreateIFA, publicContractAddress.ShareRevenue);
        poolVaultContractAddress[poolVaultName[i]] = vaultInstance.address;
        await ifaMasterInstance.addVault(kVault, vaultInstance.address);
        await ifaMasterInstance.setUniswapV2Factory(uniswapsAddress.uniswapV2Factory);
        await ifaPoolInstance.setPoolInfo(poolId, lpToken[i - 3], vaultInstance.address, now);
        allocPoint = i >= 3 ? allocPoint * 50 : allocPoint * 5
        await createIFAInstance.setPoolInfo(poolId, vaultInstance.address, lpToken[i - 3], allocPoint, false);
    }
}