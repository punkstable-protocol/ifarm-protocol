// tools
// ============ Contracts ============
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");

// public
const IFAMaster = artifacts.require('IFAMaster');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const CreateIFA = artifacts.require('CreateIFA');

const allContract = require("../deployedContract.json")

// contract address env
const net = {
    "bnbmainnet": "bnbmainnet",
    "rinkeby": "rinkeby"
}
const currentNet = net.bnbmainnet
const contract = allContract[currentNet]

const poolVaultId = {
    0: 'BirrCastle',
    1: 'Sunnylands',
    2: 'ChateauLafitte',
    3: 'AdareManor',
    4: 'VillaDEste',
    5: 'VillaLant',
    6: 'VillaFarnese',
    7: 'ChatsworthHouse',
    8: 'ChateauMargaux',
}

const tokensId = {
    0: "USDT",
    1: "BTC",
    2: "ETH",
    3: "rUSD-USDT",
    4: "rBTC-BTC",
    5: "rETH-ETH",
    6: "RICE-rUSD",
    7: "RICE-rBTC",
    8: "RICE-rETH",
}

const ifaBankAddress = contract.public.IFABank
const ifaPoolAddress = contract.public.IFAPool

const CalculatorAddress = {
    "BirrCastleCalculator": contract.calculatorsAddress.BirrCastleCalculators,
    "SunnylandsCalculator": contract.calculatorsAddress.SunnylandsCalculators,
    "ChateauLafitteCalculator": contract.calculatorsAddress.ChateauLafitteCalculators
}

const poolVaultAddress = {
    'BirrCastle': contract.poolVaults.BirrCastle,
    'Sunnylands': contract.poolVaults.Sunnylands,
    'ChateauLafitte': contract.poolVaults.ChateauLafitte,
    'AdareManor': contract.poolVaults.AdareManor,
    'VillaDEste': contract.poolVaults.VillaDEste,
    'VillaLant': contract.poolVaults.VillaLant,
    'VillaFarnese': contract.poolVaults.VillaFarnese,
    'ChatsworthHouse': contract.poolVaults.ChatsworthHouse,
    'ChateauMargaux': contract.poolVaults.ChateauMargaux,
}

const iTokenAddress = {
    "rUSD": contract.itokensAddress.rUSD,
    "rBTC": contract.itokensAddress.rBTC,
    "rETH": contract.itokensAddress.rETH
}

const tokensAddress = {
    "USDT": contract.tokensAddress.HUSD,
    "BTC": contract.tokensAddress.HBTC,
    "ETH": contract.tokensAddress.HETH,
    "rUSD-USDT": contract.lpTokenAddress.rUSD_USDT,
    "rBTC-BTC": contract.lpTokenAddress.rBTC_HBTC,
    "rETH-ETH": contract.lpTokenAddress.rETH_HETH,
    "RICE-rUSD": contract.lpTokenAddress.RICE_rUSD,
    "RICE-rBTC": contract.lpTokenAddress.RICE_rBTC,
    "RICE-rETH": contract.lpTokenAddress.RICE_rETH
}
const Calculators = [
    CalculatorAddress.BirrCastleCalculator,
    CalculatorAddress.SunnylandsCalculator,
    CalculatorAddress.ChateauLafitteCalculator
]

const getTokensAddress = (_id) => {
    return tokensAddress[tokensId[_id]]
}

const getPoolVaultAddress = (_id) => {
    return poolVaultAddress[poolVaultId[_id]]
}

const getiTokenAddress = (_id) => {
    let item = [
        iTokenAddress.rUSD,
        iTokenAddress.rBTC,
        iTokenAddress.rETH
    ]
    return item[_id]
}


// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }
    console.log(ifaBankAddress,ifaPoolAddress)
    console.log(CalculatorAddress)
    console.log(poolVaultAddress)
    console.log(iTokenAddress)
    console.log(tokensAddress)
    console.log(Calculators)

    this.ifaBankInstance = await IFABank.at(ifaBankAddress);
    this.ifaPoolInstance = await IFAPool.at(ifaPoolAddress);
    await Promise.all([
        // await setPools(0, deployer, network, accounts),
        // await setPools(3, deployer, network, accounts),
        // await setPools(6, deployer, network, accounts),

        // await setPools(2, deployer, network, accounts),
        // await setPools(5, deployer, network, accounts),
        // await setPools(8, deployer, network, accounts),

        await setPools(1, deployer, network, accounts),
        await setPools(4, deployer, network, accounts),
        await setPools(7, deployer, network, accounts)
    ]);
};

module.exports = migration;

async function setPools(poolId, deployer, network, accounts) {
    let now = Math.floor((new Date()).getTime() / 1000 - 3600);
    if (poolId < 3) {
        console.log(`Start setting ifaBank pool...`)
        await this.ifaBankInstance.setPoolInfo(poolId, getiTokenAddress(poolId), getPoolVaultAddress(poolId), Calculators[poolId]);
    }
    console.log(`Start setting ifa pool...`)
    await this.ifaPoolInstance.setPoolInfo(poolId, getTokensAddress(poolId), getPoolVaultAddress(poolId), now);
    console.log(`---------- Pool ${poolId + 1} Set successfully----------------\n`)
}