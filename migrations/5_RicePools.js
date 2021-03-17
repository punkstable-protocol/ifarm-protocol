// ============ Contracts ============
// tools
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");
const { getDeployedContract } = require("../contractAddress");
const { contracts } = require("../export/contractModel.json")

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
const Parities = artifacts.require('Parities')

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
    "rUSD_USDT": DeployedContract.lpToken.rUSD_USDT,
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

const allocPointBase = 1;


// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }
    await Promise.all([
        await mockTokens(accounts),
        await deployPublic(deployer, network, accounts),
        await deployBorrowPools(deployer, network, accounts),
        await deployLpTokenPools(deployer, network, accounts),
    ]);
    console.log(JSON.stringify(addressItem));
    console.log('\n')
    let formatAddress = {
        "contracts": contracts
    }
    console.log(JSON.stringify(formatAddress));
};

module.exports = migration;

// tools functions
async function mockTokenTool(_tokenJson, _tokenName, _account) {
    let totalSupply = ether('900000000');
    if (_tokenJson.hasOwnProperty(_tokenName) && _tokenJson[_tokenName].length == 0) {
        return await MockERC20.new(`Fake Wrapped ${_tokenName}`, `${_tokenName}`, totalSupply, { from: _account })
            .then((result) => { console.log(`${_tokenName}:`, result.address); return result; });
    }
    return await MockERC20.at(_tokenJson[_tokenName])
        .then((result) => { console.log(`${_tokenName}:`, result.address); return result; });
}


// ============ Deploy Functions ============
// Used during demonstration, not used during official release

async function mockTokens(accounts) {
    console.log(`mockTokens deployering...`)
    let _dai = await mockTokenTool(tokensAddress, 'HUSD', accounts[0]);
    let _wbtc = await mockTokenTool(tokensAddress, 'HBTC', accounts[0]);
    let _weth = await mockTokenTool(tokensAddress, 'HETH', accounts[0]);
    let _usdt = await mockTokenTool(tokensAddress, 'USDT', accounts[0]);
    let _rUSD_USDT = await mockTokenTool(lpTokenAddress, 'rUSD_USDT', accounts[0]);
    let _rBTC_HBTC = await mockTokenTool(lpTokenAddress, 'rBTC_HBTC', accounts[0]);
    let _rETH_HETH = await mockTokenTool(lpTokenAddress, 'rETH_HETH', accounts[0]);
    let _RICE_rUSD = await mockTokenTool(lpTokenAddress, 'RICE_rUSD', accounts[0]);
    let _RICE_rBTC = await mockTokenTool(lpTokenAddress, 'RICE_rBTC', accounts[0]);
    let _RICE_rETH = await mockTokenTool(lpTokenAddress, 'RICE_rETH', accounts[0]);
    tokensAddress.HUSD = _dai.address;
    tokensAddress.HBTC = _wbtc.address;
    tokensAddress.HETH = _weth.address;
    tokensAddress.USDT = _usdt.address;
    lpTokenAddress.rUSD_USDT = _rUSD_USDT.address;
    lpTokenAddress.rBTC_HBTC = _rBTC_HBTC.address;
    lpTokenAddress.rETH_HETH = _rETH_HETH.address;
    lpTokenAddress.RICE_rUSD = _RICE_rUSD.address;
    lpTokenAddress.RICE_rBTC = _RICE_rBTC.address;
    lpTokenAddress.RICE_rETH = _RICE_rETH.address;
    console.log(`mockTokens end\n`)
}

async function deployPublic(deployer, network, accounts) {
    console.log(`deployPublic deployering...`)

    let ifaMasterInstance = await IFAMaster.new()
        .then((result) => { console.log('IFAMaster:', result.address); return result; });
    let ifaPoolInstance = await IFAPool.new()
        .then((result) => { console.log('IFAPool:', result.address); return result; });
    let ParitiesInstance = await Parities.new(ifaMasterInstance.address)
        .then((result) => { console.log('Parities:', result.address); return result; });

    let ifaInstance = null;
    if (tokensAddress.RICE.length == 0) {
        ifaInstance = await IFAToken.new()
            .then((result) => { console.log('IFAToken:', result.address); return result; });
    } else {
        ifaInstance = await IFAToken.at(tokensAddress.RICE)
            .then((result) => { console.log('IFAToken:', result.address); return result; });
    }

    await ifaMasterInstance.setIFA(ifaInstance.address);
    await ifaMasterInstance.setPool(ifaPoolInstance.address);

    let costcoInstance = await Costco.new(ifaMasterInstance.address)
        .then((result) => { console.log('Costco:', result.address); return result; });
    let ifaDataBoardInstance = await IFADataBoard.new(ifaMasterInstance.address)
        .then((result) => { console.log('IFADataBoard:', result.address); return result; });
    let ifaRevenueInstance = await IFARevenue.new(ifaMasterInstance.address)
        .then((result) => { console.log('IFARevenue:', result.address); return result; });
    let createIFAInstance = await CreateIFA.new(ifaMasterInstance.address)
        .then((result) => { console.log('CreateIFA:', result.address); return result; });
    let ifaBankInstance = await IFABank.new(ifaMasterInstance.address)
        .then((result) => { console.log('IFABank:', result.address); return result; });
    let shareRevenueInstance = await ShareRevenue.new(ifaMasterInstance.address)
        .then((result) => { console.log('ShareReenue:', result.address); return result; });

    await ifaMasterInstance.setiToken(K_MADE_rUSD, itokensAddress.rUSD);
    await ifaMasterInstance.setiToken(K_MADE_rBTC, itokensAddress.rBTC);
    await ifaMasterInstance.setiToken(K_MADE_rETH, itokensAddress.rETH);
    await ifaMasterInstance.setDAI(tokensAddress.HUSD);
    await ifaMasterInstance.setwBTC(tokensAddress.HBTC);
    await ifaMasterInstance.setwETH(tokensAddress.HETH);
    await ifaMasterInstance.setUSD(tokensAddress.USDT);
    await ifaMasterInstance.setiUSD(itokensAddress.rUSD);
    await ifaMasterInstance.setiBTC(itokensAddress.rBTC);
    await ifaMasterInstance.setiETH(itokensAddress.rETH);
    await ifaMasterInstance.setCostco(costcoInstance.address);
    await ifaMasterInstance.setRevenue(ifaRevenueInstance.address);
    await ifaMasterInstance.setBank(ifaBankInstance.address);
    await ifaMasterInstance.addStrategy(K_STRATEGY_CREATE_IFA, createIFAInstance.address);
    await ifaMasterInstance.addStrategy(K_STRATEGY_SHARE_REVENUE, shareRevenueInstance.address);
    await ifaInstance.addMinter(createIFAInstance.address);
    let itokenContract = [
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rUSD),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rBTC),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rETH)
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
    publicContractAddress.Parities = ParitiesInstance.address;
    tokensAddress.RICE = ifaInstance.address;
    console.log(`deployPublic end\n`)
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
        let vaultInstance = await vault.new(ifaMasterInstance.address, publicContractAddress.CreateIFA)
            .then((result) => { console.log(`${poolVaultName[i]}:`, result.address); return result; });
        let name = poolVaultName[i];
        poolVaultContractAddress[poolVaultName[i]] = vaultInstance.address;
        let BCParams = { rate: 500, minimumLTV: 65, maxmumLTV: 90, minimumSize: web3.utils.toWei('500') };
        switch (i) {
            case 0:
                BCParams.rate = 500;
                BCParams.minimumLTV = 65;
                BCParams.maxmumLTV = 90;
                BCParams.minimumSize = web3.utils.toWei('500');
                break;
            case 1:
                BCParams.rate = 600;
                BCParams.minimumLTV = 75;
                BCParams.maxmumLTV = 90;
                BCParams.minimumSize = web3.utils.toWei('0.05');
                break;
            case 2:
                BCParams.rate = 550;
                BCParams.minimumLTV = 70;
                BCParams.maxmumLTV = 90;
                BCParams.minimumSize = web3.utils.toWei('1');
                break;
            default:
                console.log(`Error: borrow pool_id = ${i}`)
                break;
        }
        let basicCalculator = await BasicCalculator.new(ifaMasterInstance.address, BCParams.rate, BCParams.minimumLTV, BCParams.maxmumLTV, BCParams.minimumSize)
            .then((result) => { console.log(`${name}Calculators:`, result.address); return result; });
        calculatorsAddress[`${name}Calculators`] = basicCalculator.address;
        await ifaMasterInstance.addVault(kVault, vaultInstance.address);
        await ifaMasterInstance.setUniswapV2Factory(uniswapsAddress.factory);
        await ifaMasterInstance.addCalculator(K_CALCULATOR, basicCalculator.address);
        await ifaBankInstance.setPoolInfo(poolId, itokenAddress[i], vaultInstance.address, basicCalculator.address);
        await ifaPoolInstance.setPoolInfo(poolId, tokenAddress[i], vaultInstance.address, now);
        await createIFAInstance.setPoolInfo(poolId, vaultInstance.address, tokenAddress[i], allocPointBase, false);
    }
    console.log(`deployBorrowPools end\n`)
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
        lpTokenAddress.rUSD_USDT,
        lpTokenAddress.rBTC_HBTC,
        lpTokenAddress.rETH_HETH,
        lpTokenAddress.RICE_rUSD,
        lpTokenAddress.RICE_rBTC,
        lpTokenAddress.RICE_rETH
    ];
    let ifaMasterInstance = await IFAMaster.at(publicContractAddress.IFAMaster);
    let ifaPoolInstance = await IFAPool.at(publicContractAddress.IFAPool);
    let createIFAInstance = await CreateIFA.at(publicContractAddress.CreateIFA);
    let allocPoint = allocPointBase;
    for (let i = 3; i < vaults.length + 3; i++) {
        // console.log(`lptoken: ${lpToken[i - 3]}`)
        let poolId = i;
        let kVault = i
        let vault = vaults[kVault - 3];
        let now = Math.floor((new Date()).getTime() / 1000 - 3600);
        let vaultInstance = await vault.new(ifaMasterInstance.address, publicContractAddress.CreateIFA, publicContractAddress.ShareRevenue)
            .then((result) => { console.log(`${poolVaultName[i]}:`, result.address); return result; });
        poolVaultContractAddress[poolVaultName[i]] = vaultInstance.address;
        await ifaMasterInstance.addVault(kVault, vaultInstance.address);
        await ifaMasterInstance.setUniswapV2Factory(uniswapsAddress.factory);
        await ifaPoolInstance.setPoolInfo(poolId, lpToken[i - 3], vaultInstance.address, now);
        if (i > 2 && i <= 5) {
            allocPoint = allocPointBase * 5
        }
        else if (i > 5) {
            allocPoint = allocPointBase * 50
        }
        await createIFAInstance.setPoolInfo(poolId, vaultInstance.address, lpToken[i - 3], allocPoint, false);
    }
    console.log(`deployLpTokenPools end\n`)

    // export address
    contracts.uniswapV2Factory = uniswapsAddress.factory;
    contracts.uniswapV2Router = uniswapsAddress.router;
    contracts.rUSD = itokensAddress.rUSD
    contracts.rBTC = itokensAddress.rBTC
    contracts.rETH = itokensAddress.rETH

    contracts.USDT = addressItem.tokensAddress.HUSD
    contracts.HBTC = addressItem.tokensAddress.HBTC
    contracts.ETH = addressItem.tokensAddress.HETH
    contracts.RICE = addressItem.tokensAddress.RICE
    contracts.USD = addressItem.tokensAddress.USDT

    contracts.iUSD_DAI = addressItem.lpTokenAddress.rUSD_USDT
    contracts.iBTC_wBTC = addressItem.lpTokenAddress.rBTC_HBTC
    contracts.iETH_ETH = addressItem.lpTokenAddress.rETH_HETH
    contracts.IFA_DAI = addressItem.lpTokenAddress.RICE_rUSD
    contracts.IFA_wBTC = addressItem.lpTokenAddress.RICE_rBTC
    contracts.IFA_ETH = addressItem.lpTokenAddress.RICE_rETH

    contracts.IFAMaster = addressItem.public.IFAMaster
    contracts.IFAPool = addressItem.public.IFAPool
    contracts.IFABank = addressItem.public.IFABank
    contracts.IFARevenue = addressItem.public.IFARevenue
    contracts.Costco = addressItem.public.Costco
    contracts.IFADataBoard = addressItem.public.IFADataBoard
    contracts.CreateIFA = addressItem.public.CreateIFA
    contracts.ShareRevenue = addressItem.public.ShareRevenue

    contracts.BirrCastle = addressItem.poolVaults.BirrCastle
    contracts.Sunnylands = addressItem.poolVaults.Sunnylands
    contracts.ChateauLafitte = addressItem.poolVaults.ChateauLafitte
    contracts.AdareManor = addressItem.poolVaults.AdareManor
    contracts.VillaDEste = addressItem.poolVaults.VillaDEste
    contracts.VillaLant = addressItem.poolVaults.VillaLant
    contracts.VillaFarnese = addressItem.poolVaults.VillaFarnese
    contracts.ChatsworthHouse = addressItem.poolVaults.ChatsworthHouse
    contracts.ChateauMargaux = addressItem.poolVaults.ChateauMargaux

    contracts.BirrCastleCalculators = addressItem.calculatorsAddress.BirrCastleCalculators
    contracts.SunnylandsCalculators = addressItem.calculatorsAddress.SunnylandsCalculators
    contracts.ChateauLafitteCalculators = addressItem.calculatorsAddress.ChateauLafitteCalculators

}