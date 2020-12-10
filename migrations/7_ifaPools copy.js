// ============ Contracts ============
// tools
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");

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

// Contract address
const uniswapsAddress = {
    'uniswapV2Factory': "0x676E9eA0f226948A9c52284e67e812e7D66AF7a3",
    'uniswapV2Router': "0x6764568DbaDd6ED94FB21d5B5B102d50B805310a",
}

const itokensAddress = {
    'iETH': "0x600B3132Bb97aA7D1D6bE574e8a4AF693A959dAF",
    'iBTC': "0x638D8bc5cB98194c90DECF8aA6Faf10403b45C0A",
    'iUSD': "0x4935773025eAC3dC8ce4258077E2257F1d70C206",
}

let tokensAddress = {
    'DAI': '',
    'wBTC': '',
    'wETH': '',
    'IFA': '',
    'USD': ''
}

let publicContractAddress = {
    'ifaMaster': '',
    'ifaPool': '',
    'ifaBank': '',
    'ifaRevenue': '',
    'costco': '',
    'ifaDataBoard': '',
    'createIFA': '',
}

let calculatorsAddress = {
    'DAICalculator': '',
    'wBTCCalculator': '',
    'wETHCalculator': '',
}

let poolVaultContractAddress = {
    'birrCastle': '',
    'sunnylands': '',
    'chateauLafitte': '',
    'adareManor': '',
    'villaDEste': '',
    'villaLant': '',
    'villaFarnese': '',
    'chatsworthHouse': '',
    'chateauMargaux': '',
}

const addressItem = {
    'uniswap': uniswapsAddress,
    'itokensAddress': itokensAddress,
    'tokensAddress': tokensAddress,
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
        mockToken(accounts),
        deployPublic(deployer, network, accounts),
        deployBorrowPools(deployer, network, accounts),
    ]);
    console.log(JSON.stringify(addressItem));
};

module.exports = migration;

// ============ Deploy Functions ============
// Used during demonstration, not used during official release

async function mockToken(accounts) {
    let totalSupply = ether('900000000');
    let _dai = await MockERC20.new('Fake Wrapped DAI', 'DAI', totalSupply, { from: accounts[0] });
    let _wbtc = await MockERC20.new('Fake Wrapped wBTC', 'wBTC', totalSupply, { from: accounts[0] });
    let _weth = await MockERC20.new('Fake Wrapped wETH', 'wETH', totalSupply, { from: accounts[0] });
    let _usd = await MockERC20.new('Fake Wrapped USD', 'USD', totalSupply, { from: accounts[0] });
    tokensAddress.DAI = _dai.address;
    tokensAddress.wBTC = _wbtc.address;
    tokensAddress.wETH = _weth.address;
    tokensAddress.USD = _usd.address;
}

async function deployPublic(deployer, network, accounts) {
    let ifaMasterInstance = await IFAMaster.new();
    console.log(ifaMasterInstance.address);
    console.log(IFAMaster.address);
    return
    await deployer.deploy(IFAMaster);
    await deployer.deploy(IFAToken);
    await deployer.deploy(IFAPool);
    // let ifaMasterInstance = await IFAMaster.deployed();
    let ifaInstance = await IFAToken.deployed();
    await ifaMasterInstance.setIFA(IFAToken.address);
    await ifaMasterInstance.setPool(IFAPool.address);
    await deployer.deploy(Costco, IFAMaster.address);
    await deployer.deploy(IFADataBoard, IFAMaster.address);
    await deployer.deploy(IFARevenue, IFAMaster.address);
    await deployer.deploy(CreateIFA, IFAMaster.address);
    await deployer.deploy(IFABank, IFAMaster.address);
    await ifaMasterInstance.setiToken(K_MADE_iUSD, itokensAddress.iUSD);
    await ifaMasterInstance.setiToken(K_MADE_iBTC, itokensAddress.iBTC);
    await ifaMasterInstance.setiToken(K_MADE_iETH, itokensAddress.iETH);
    await ifaMasterInstance.setDAI(tokensAddress.DAI);
    await ifaMasterInstance.setwBTC(tokensAddress.wBTC);
    await ifaMasterInstance.setwETH(tokensAddress.wETH);
    await ifaMasterInstance.setUSD(tokensAddress.USD);
    await ifaMasterInstance.setCostco(Costco.address);
    await ifaMasterInstance.setRevenue(IFARevenue.address);
    await ifaMasterInstance.setBank(IFABank.address);
    await ifaMasterInstance.addStrategy(K_STRATEGY_CREATE_IFA, CreateIFA.address);
    await ifaInstance.addMinter(CreateIFA.address);
    let itokenContract = [
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.iUSD),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.iBTC),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.iETH),
    ]
    for (let i = 0; itokenContract.length < i; i++) {
        itokenContract[i].methods._setBanker(IFABank.address).send({ from: accounts[0] });
    }
    publicContractAddress.ifaMaster = IFAMaster.address;
    publicContractAddress.ifaPool = IFAPool.address;
    publicContractAddress.costco = Costco.address;
    publicContractAddress.ifaDataBoard = IFADataBoard.address;
    publicContractAddress.ifaRevenue = IFARevenue.address;
    publicContractAddress.createIFA = CreateIFA.address;
    publicContractAddress.ifaBank = IFABank.address;
    tokensAddress.IFA = IFAToken.address;
}

// depoly borrow pools total:3
async function deployBorrowPools(deployer, network, accounts) {
    return
    let vaults = [BirrCastle, Sunnylands, ChateauLafitte];
    let K_CALCULATORS = [K_CALCULATOR_DAI, K_CALCULATOR_wBTC, K_CALCULATOR_wETH];
    let itokenAddress = [itokensAddress.iUSD, itokensAddress.iBTC, itokensAddress.iETH];
    let tokenAddress = [tokensAddress.DAI, tokensAddress.wBTC, tokensAddress.wETH];
    let ifaMasterInstance = await IFAMaster.deployed();
    let ifaBankInstance = await IFABank.deployed();
    let ifaPoolInstance = await IFAPool.deployed();
    let createIFAInstance = await CreateIFA.deployed();
    console.log(`ifaMasterInstance:${ifaMasterInstance.address}`);
    for (let i = 0; i < vaults.length; i++) {
        let poolId = i;
        let K_CALCULATOR = K_CALCULATORS[i];
        let kVault = i
        let vault = vaults[kVault];
        let now = Math.floor((new Date()).getTime() / 1000 - 3600);
        await deployer.deploy(vault, ifaMasterInstance.address, CreateIFA.address);
        poolVaultContractAddress[i] = vault.address;
        let basicCalculator = await BasicCalculator.new(ifaMasterInstance.address, 500, 70, 90, 200000)
        calculatorsAddress[i] = basicCalculator.address;
        await ifaMasterInstance.addVault(kVault, vault.address);
        await ifaMasterInstance.setUniswapV2Factory(uniswapsAddress.uniswapV2Factory);
        await ifaMasterInstance.addCalculator(K_CALCULATOR, basicCalculator.address);
        await ifaBankInstance.setPoolInfo(poolId, itokenAddress[i], vault.address, now);
        await ifaPoolInstance.setPoolInfo(poolId, tokenAddress[i], vault.address, now);
        await createIFAInstance.setPoolInfo(poolId, vault.address, tokenAddress[i], 100, false);
    }
}
