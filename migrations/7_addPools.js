// tools
// ============ Contracts ============
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");

// public
const IFAMaster = artifacts.require('IFAMaster');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const CreateIFA = artifacts.require('CreateIFA');

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
const Chillon = artifacts.require('Chillon');
const Frederiksborg = artifacts.require('Frederiksborg');
const Prague = artifacts.require('Prague');
const RossCastle = artifacts.require('RossCastle');
const HunyadCastle = artifacts.require('HunyadCastle');
const WhittingtonCastle = artifacts.require('WhittingtonCastle');

const Bojnickyzamok = artifacts.require('Bojnickyzamok');
const MontStMichel = artifacts.require('MontStMichel');
const SchwerinCastle = artifacts.require('SchwerinCastle');
const Pierrefonds = artifacts.require('Pierrefonds');
const Obidos = artifacts.require('Obidos');
const Mespelbrunn = artifacts.require('Mespelbrunn');


const allContract = require("../deployedContract.json")

// contract address env
const net = {
    "bnbmainnet": "bnbmainnet",
    "rinkeby": "rinkeby",
    "remote": "remote"
}
const currentNet = net.bnbmainnet
const contract = allContract[currentNet]

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

let IFAVaultsId = {
    0: 'BirrCastle',
    1: 'Sunnylands',
    2: 'ChateauLafitte',
    3: 'AdareManor',
    4: 'VillaDEste',
    5: 'VillaLant',
    6: 'VillaFarnese',
    7: 'ChatsworthHouse',
    8: 'ChateauMargaux',
    9: 'Chillon',
    10: 'Frederiksborg',
    11: 'Prague',
    12: 'RossCastle',
    13: 'HunyadCastle',
    14: 'WhittingtonCastle',
    15: 'Bojnickyzamok',
    16: 'MontStMichel',
    17: 'SchwerinCastle',
    18: 'Pierrefonds',
    19: 'Obidos',
    20: 'Mespelbrunn'
}

const allocPointBase = 1;

// Whether to enable the pool
const POOL_ENABLE_STATUS = {
    0: false,       // pool 1
    1: false,        // pool 2
    2: false,       // pool 3
    3: false,       // pool 4
    4: false,        // pool 5
    5: false,       // pool 6
    6: false,       // pool 7
    7: false,        // pool 8
    8: false,        // pool 9
    9: false,        // pool 10
    10: false,        // pool 11
    11: false,        // pool 12
    12: false,        // pool 13
    13: false,        // pool 14
    14: false,        // pool 15
    15: true,
    16: true,
    17: true,
    18: true,
    19: true,
    20: true
}

// parmas
const publicContractAddress = {
    "IFAMaster": contract.public.IFAMaster,
    "IFAPool": contract.public.IFAPool,
    "IFABank": contract.public.IFABank,
    "CreateIFA": contract.public.CreateIFA,
    "ShareRevenue": contract.public.ShareRevenue,
}

const itokensAddress = {
    "rETH": contract.itokensAddress.rETH,
    "rBTC": contract.itokensAddress.rBTC,
    "rUSD": contract.itokensAddress.rUSD
}

const tokensAddress = {
    "HUSD": contract.tokensAddress.HUSD,
    "HBTC": contract.tokensAddress.HBTC,
    "HETH": contract.tokensAddress.HETH
}

const lpTokenAddress = {
    "rUSD_USDT": contract.lpTokenAddress.rUSD_USDT,
    "rBTC_HBTC": contract.lpTokenAddress.rBTC_HBTC,
    "rETH_HETH": contract.lpTokenAddress.rETH_HETH,
    "RICE_rUSD": contract.lpTokenAddress.RICE_rUSD,
    "RICE_rBTC": contract.lpTokenAddress.RICE_rBTC,
    "RICE_rETH": contract.lpTokenAddress.RICE_rETH,
    "BNB_rUSD": contract.lpTokenAddress.BNB_rUSD,
    "BNB_rBTC": contract.lpTokenAddress.BNB_rBTC,
    "BNB_rETH": contract.lpTokenAddress.BNB_rETH,
    "Cake_rUSD": contract.lpTokenAddress.Cake_rUSD,
    "Cake_rBTC": contract.lpTokenAddress.Cake_rBTC,
    "Cake_rETH": contract.lpTokenAddress.Cake_rETH,
    "XVS_rUSD": contract.lpTokenAddress.XVS_rUSD,
    "XVS_rBTC": contract.lpTokenAddress.XVS_rBTC,
    "XVS_rETH": contract.lpTokenAddress.XVS_rETH,
    "DEGO_rUSD": contract.lpTokenAddress.DEGO_rUSD,
    "DEGO_rBTC": contract.lpTokenAddress.DEGO_rBTC,
    "DEGO_rETH": contract.lpTokenAddress.DEGO_rETH
}

const contractAddress = {
    "poolVaults": {},
    "calculator": {},
    "token": [itokensAddress, tokensAddress]
}

// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }
    if (currentNet != network) {
        console.log(`env err, current: ${currentNet}, expect: ${network}`)
        return
    }
    console.log(publicContractAddress)
    console.log(itokensAddress)
    console.log(tokensAddress)
    console.log(lpTokenAddress)

    await Promise.all([
        await deployBorrowPools(deployer, network, accounts),
        await deployLpTokenPools(deployer, network, accounts),
    ]);
    console.log(JSON.stringify(contractAddress));
    console.log('\n')
};

module.exports = migration;

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
    let itokenContract = [
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rUSD),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rBTC),
        new web3.eth.Contract(iTokenDelegator.abi, itokensAddress.rETH)
    ]

    for (let i = 0; i < vaults.length; i++) {
        // Whether to deploy the current pool , Do not deploy when POOL_ENABLE_STATUS is false
        if (!POOL_ENABLE_STATUS[i]) {
            continue;
        }
        let poolId = i;
        let K_CALCULATOR = K_CALCULATORS[i];
        let kVault = i
        let vault = vaults[kVault];
        let now = Math.floor((new Date()).getTime() / 1000 - 3600);
        let vaultInstance = await vault.new(ifaMasterInstance.address, publicContractAddress.CreateIFA)
            .then((result) => { console.log(`${IFAVaultsId[i]}:`, result.address); return result; });
        let name = IFAVaultsId[i];
        contractAddress.poolVaults[IFAVaultsId[i]] = vaultInstance.address;
        // set rTokens
        switch (i) {
            case 0:
                await ifaMasterInstance.setiUSD(itokensAddress.rUSD);
                await ifaMasterInstance.setiToken(K_MADE_rUSD, itokensAddress.rUSD);
                break;
            case 1:
                await ifaMasterInstance.setiBTC(itokensAddress.rBTC);
                await ifaMasterInstance.setiToken(K_MADE_rBTC, itokensAddress.rBTC);
                break;
            case 2:
                await ifaMasterInstance.setiETH(itokensAddress.rETH);
                await ifaMasterInstance.setiToken(K_MADE_rETH, itokensAddress.rETH);
                break;
            default:
                console.log(`Error: set rToken fail pool_id = ${i}`)
                break;
        }
        await itokenContract[i].methods._setBanker(ifaBankInstance.address).send({ from: accounts[0] });
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
        contractAddress.calculator[`${name}Calculators`] = basicCalculator.address;
        await ifaMasterInstance.addVault(kVault, vaultInstance.address);
        await ifaMasterInstance.addCalculator(K_CALCULATOR, basicCalculator.address);
        // close pool
        // await ifaBankInstance.setPoolInfo(poolId, itokenAddress[i], vaultInstance.address, basicCalculator.address);
        // await ifaPoolInstance.setPoolInfo(poolId, tokenAddress[i], vaultInstance.address, now);
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
        ChateauMargaux,
        Chillon,
        Frederiksborg,
        Prague,
        RossCastle,
        HunyadCastle,
        WhittingtonCastle,
        Bojnickyzamok,
        MontStMichel,
        SchwerinCastle,
        Pierrefonds,
        Obidos,
        Mespelbrunn
    ];
    let lpToken = [
        lpTokenAddress.rUSD_USDT,
        lpTokenAddress.rBTC_HBTC,
        lpTokenAddress.rETH_HETH,
        lpTokenAddress.RICE_rUSD,
        lpTokenAddress.RICE_rBTC,
        lpTokenAddress.RICE_rETH,
        lpTokenAddress.BNB_rUSD,
        lpTokenAddress.BNB_rBTC,
        lpTokenAddress.BNB_rETH,
        lpTokenAddress.Cake_rUSD,
        lpTokenAddress.Cake_rBTC,
        lpTokenAddress.Cake_rETH,
        lpTokenAddress.XVS_rUSD,
        lpTokenAddress.XVS_rBTC,
        lpTokenAddress.XVS_rETH,
        lpTokenAddress.DEGO_rUSD,
        lpTokenAddress.DEGO_rBTC,
        lpTokenAddress.DEGO_rETH
    ];
    let ifaMasterInstance = await IFAMaster.at(publicContractAddress.IFAMaster);
    let ifaPoolInstance = await IFAPool.at(publicContractAddress.IFAPool);
    let createIFAInstance = await CreateIFA.at(publicContractAddress.CreateIFA);
    let allocPoint = allocPointBase;
    for (let i = 3; i < vaults.length + 3; i++) {
        // Whether to deploy the current pool , Do not deploy when POOL_ENABLE_STATUS is false
        if (!POOL_ENABLE_STATUS[i]) {
            continue;
        }
        let poolId = i;
        let kVault = i
        let vault = vaults[kVault - 3];
        let now = Math.floor((new Date()).getTime() / 1000 - 3600);
        let vaultInstance = await vault.new(ifaMasterInstance.address, publicContractAddress.CreateIFA, publicContractAddress.ShareRevenue)
            .then((result) => { console.log(`${IFAVaultsId[i]}:`, result.address); return result; });
        contractAddress.poolVaults[IFAVaultsId[i]] = vaultInstance.address;
        await ifaMasterInstance.addVault(kVault, vaultInstance.address);
        // close pool
        // await ifaPoolInstance.setPoolInfo(poolId, lpToken[i - 3], vaultInstance.address, now);
        if (i > 2 && i <= 5) {
            allocPoint = allocPointBase * 5
        }
        else if (i > 5 && i <= 8) {
            allocPoint = allocPointBase * 50
        }
        else if (i > 8 && i <= 20) {
            allocPoint = allocPointBase * 10
        }
        await createIFAInstance.setPoolInfo(poolId, vaultInstance.address, lpToken[i - 3], allocPoint, false);
    }
    console.log(`deployLpTokenPools end\n`)
}