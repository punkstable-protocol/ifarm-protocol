// ============ Contracts ============
// tools
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");
const { getDeployedContract } = require("../contractAddress")

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
    'factory': DeployedContract.mdex.factory,
    'router': DeployedContract.mdex.router,
}

const itokensAddress = {
    'rETH': DeployedContract.itokens.rETH,
    'rBTC': DeployedContract.itokens.rBTC,
    'rUSD': DeployedContract.itokens.rUSD,
}

let tokensAddress = {
    'HUSD': DeployedContract.tokens.HUSD,
    'HBTC': DeployedContract.tokens.HBTC,
    'HETH': DeployedContract.tokens.HETH,
    'WHT': DeployedContract.tokens.WHT,
    'RICE': DeployedContract.tokens.RICE,
    'USDT': DeployedContract.tokens.USDT,
}

let lpTokenAddress = {
    "rUSD_HUSD": DeployedContract.lpToken.rUSD_HUSD,
    "rBTC_HBTC": DeployedContract.lpToken.rBTC_HBTC,
    "rETH_HETH": DeployedContract.lpToken.rETH_HETH,
    "RICE_rUSD": DeployedContract.lpToken.RICE_rUSD,
    "RICE_rBTC": DeployedContract.lpToken.RICE_rBTC,
    "RICE_rETH": DeployedContract.lpToken.RICE_rETH,
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
const K_MADE_rUSD = 0;
const K_MADE_rBTC = 1;
const K_MADE_rETH = 2;

// Strategy addresses are mutable:
// seed token pool use
const K_STRATEGY_CREATE_IFA = 0;
// seed lp token pool use
const K_STRATEGY_SHARE_REVENUE = 1;

// Calculator addresses are mutable ( borrow use )
const K_CALCULATOR_HUSD = 0;
const K_CALCULATOR_HBTC = 1;
const K_CALCULATOR_HETH = 2;


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
    console.log(`mockTokens deployering...`)
    let _dai = await mockTokenTool(tokensAddress, 'HUSD', accounts[0]);
    let _wbtc = await mockTokenTool(tokensAddress, 'HBTC', accounts[0]);
    let _weth = await mockTokenTool(tokensAddress, 'HETH', accounts[0]);
    let _usdt = await mockTokenTool(tokensAddress, 'USDT', accounts[0]);
    let _rUSD_HUSD = await mockTokenTool(lpTokenAddress, 'rUSD_HUSD', accounts[0]);
    let _rBTC_HBTC = await mockTokenTool(lpTokenAddress, 'rBTC_HBTC', accounts[0]);
    let _rETH_HETH = await mockTokenTool(lpTokenAddress, 'rETH_HETH', accounts[0]);
    let _RICE_rUSD = await mockTokenTool(lpTokenAddress, 'RICE_rUSD', accounts[0]);
    let _RICE_rBTC = await mockTokenTool(lpTokenAddress, 'RICE_rBTC', accounts[0]);
    let _RICE_rETH = await mockTokenTool(lpTokenAddress, 'RICE_rETH', accounts[0]);
    tokensAddress.HUSD = _dai.address;
    tokensAddress.HBTC = _wbtc.address;
    tokensAddress.HETH = _weth.address;
    tokensAddress.USDT = _usdt.address;
    lpTokenAddress.rUSD_HUSD = _rUSD_HUSD.address;
    lpTokenAddress.rBTC_HBTC = _rBTC_HBTC.address;
    lpTokenAddress.rETH_HETH = _rETH_HETH.address;
    lpTokenAddress.RICE_rUSD = _RICE_rUSD.address;
    lpTokenAddress.RICE_rBTC = _RICE_rBTC.address;
    lpTokenAddress.RICE_rETH = _RICE_rETH.address;
    console.log(`mockTokens end`)
}

async function deployPublic(deployer, network, accounts) {
    console.log(`deployPublic deployering...`)
    let ifaMasterInstance = await IFAMaster.new();
    let ifaPoolInstance = await IFAPool.new();
    let ifaInstance = tokensAddress.RICE.length == 0 ? await IFAToken.new() : await IFAToken.at(tokensAddress.RICE);
    await ifaMasterInstance.setIFA(ifaInstance.address);
    await ifaMasterInstance.setPool(ifaPoolInstance.address);
    let costcoInstance = await Costco.new(ifaMasterInstance.address);
    let ifaDataBoardInstance = await IFADataBoard.new(ifaMasterInstance.address);
    let ifaRevenueInstance = await IFARevenue.new(ifaMasterInstance.address);
    let createIFAInstance = await CreateIFA.new(ifaMasterInstance.address);
    let ifaBankInstance = await IFABank.new(ifaMasterInstance.address);
    let shareRevenueInstance = await ShareRevenue.new(ifaMasterInstance.address);
    await ifaMasterInstance.setiToken(K_MADE_rUSD, itokensAddress.rUSD);
    await ifaMasterInstance.setiToken(K_MADE_rBTC, itokensAddress.rBTC);
    await ifaMasterInstance.setiToken(K_MADE_rETH, itokensAddress.rETH);
    await ifaMasterInstance.setDAI(tokensAddress.HUSD);
    await ifaMasterInstance.setwBTC(tokensAddress.HBTC);
    await ifaMasterInstance.setwETH(tokensAddress.HETH);
    await ifaMasterInstance.setUSD(tokensAddress.USDT);
    await ifaMasterInstance.setCostco(costcoInstance.address);
    await ifaMasterInstance.setRevenue(ifaRevenueInstance.address);
    await ifaMasterInstance.setBank(ifaBankInstance.address);
    await ifaMasterInstance.addStrategy(K_STRATEGY_CREATE_IFA, createIFAInstance.address);
    await ifaMasterInstance.addStrategy(K_STRATEGY_SHARE_REVENUE, shareRevenueInstance.address);
    await ifaInstance.addMinter(createIFAInstance.address);
    let itokenContract = [
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rUSD),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rBTC),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rETH),
    ]
    for (let i = 0; i < itokenContract.length; i++) {
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
    tokensAddress.RICE = ifaInstance.address;
    console.log(`deployPublic end`)
}


// depoly borrow pools total:3
async function deployBorrowPools(deployer, network, accounts) {
    console.log(`deployBorrowPools deployering...`)
    let vaults = [BirrCastle, Sunnylands, ChateauLafitte];
    let K_CALCULATORS = [K_CALCULATOR_HUSD, K_CALCULATOR_HBTC, K_CALCULATOR_HETH];
    let itokenAddress = [itokensAddress.rUSD, itokensAddress.rBTC, itokensAddress.rETH];
    let tokenAddress = [tokensAddress.HUSD, tokensAddress.HBTC, tokensAddress.HETH];
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
        await ifaMasterInstance.setUniswapV2Factory(uniswapsAddress.factory);
        await ifaMasterInstance.addCalculator(K_CALCULATOR, basicCalculator.address);
        await ifaBankInstance.setPoolInfo(poolId, itokenAddress[i], vaultInstance.address, basicCalculator.address);
        await ifaPoolInstance.setPoolInfo(poolId, tokenAddress[i], vaultInstance.address, now);
        await createIFAInstance.setPoolInfo(poolId, vaultInstance.address, tokenAddress[i], 100, false);
    }
    console.log(`deployBorrowPools end`)
}

// depoly lp token pools total:6
async function deployLpTokenPools(deployer, network, accounts) {
    console.log(`deployLpTokenPools deployering...`)
    let vaults = [
        AdareManor,
        VillaDEste,
        VillaLant,
        VillaFarnese,
        ChatsworthHouse,
        ChateauMargaux
    ];
    let lpToken = [
        lpTokenAddress.rUSD_HUSD,
        lpTokenAddress.rBTC_HBTC,
        lpTokenAddress.rETH_HETH,
        lpTokenAddress.RICE_rUSD,
        lpTokenAddress.RICE_rBTC,
        lpTokenAddress.RICE_rETH
    ];
    let ifaMasterInstance = await IFAMaster.at(publicContractAddress.IFAMaster);
    let ifaPoolInstance = await IFAPool.at(publicContractAddress.IFAPool);
    let createIFAInstance = await CreateIFA.at(publicContractAddress.CreateIFA);
    let allocPoint = 100;
    for (let i = 3; i < vaults.length + 3; i++) {
        console.log(`lptoken: ${lpToken[i - 3]}`)
        let poolId = i;
        let kVault = i
        let vault = vaults[kVault - 3];
        let now = Math.floor((new Date()).getTime() / 1000 - 3600);
        let vaultInstance = await vault.new(ifaMasterInstance.address, publicContractAddress.CreateIFA, publicContractAddress.ShareRevenue);
        poolVaultContractAddress[poolVaultName[i]] = vaultInstance.address;
        await ifaMasterInstance.addVault(kVault, vaultInstance.address);
        await ifaMasterInstance.setUniswapV2Factory(uniswapsAddress.factory);
        await ifaPoolInstance.setPoolInfo(poolId, lpToken[i - 3], vaultInstance.address, now);
        if(i > 2){
            allocPoint = allocPoint * 5
        }
        else if(i>5){
            allocPoint = allocPoint * 50
        }
        await createIFAInstance.setPoolInfo(poolId, vaultInstance.address, lpToken[i - 3], allocPoint, false);
    }
    console.log(`deployLpTokenPools end`)
}