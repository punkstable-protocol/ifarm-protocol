// tools
// ============ Contracts ============
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");

// public
const IFAMaster = artifacts.require('IFAMaster');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const CreateIFA = artifacts.require('CreateIFA');

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

const ifaBankAddress = "0xA6eDBc1ab479E66b16d24D18403b1B349e062a8a"
const ifaPoolAddress = "0x7A08453aA3a4EFA19D90c783702Ce93cE7998288"

const CalculatorAddress = {
    "BirrCastleCalculator": "0x2C21448675B849d4C1b209F298ADaBECdBBE1D67",
    "SunnylandsCalculator": "",
    "ChateauLafitteCalculator": ""
}

const poolVaultAddress = {
    'BirrCastle': "0x79469Ab5627B85066f6BccEf91adC98f4a88cD1B",
    'Sunnylands': "",
    'ChateauLafitte': "",
    'AdareManor': "0x5a42961AcF062672D66f6bB550384f8442102709",
    'VillaDEste': "",
    'VillaLant': "",
    'VillaFarnese': "0xc110A949B61fc47cFE4a40cB87925faeC18CAE34",
    'ChatsworthHouse': "",
    'ChateauMargaux': "",
}

const iTokenAddress = {
    "rUSD": "0x4779DAEa8E7259514aBAEa2918B767B0B576FBC1",
    "rBTC": "0xA4b9BA0A8CD1A183fd9B0A235D719286AdDC2bcb",
    "rETH": "0x5f7c33Ef5Bd357F73Ca8D090fd124dF7c2c8B372"
}

const tokensAddress = {
    "USDT": "0x55d398326f99059fF775485246999027B3197955",
    "BTC": "",
    "ETH": "",
    "rUSD-USDT": "0x12c0e8B32f43DF781fbFD26d38b7Ee6CF4b6b62f",
    "rBTC-BTC": "",
    "rETH-ETH": "",
    "RICE-rUSD": "0x08ac513dF9Ad4F1B40bd860d31Ff7a3d1b594B60",
    "RICE-rBTC": "",
    "RICE-rETH": ""
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
    this.ifaBankInstance = await IFABank.at(ifaBankAddress);
    this.ifaPoolInstance = await IFAPool.at(ifaPoolAddress);
    await Promise.all([
        await setPools(0, deployer, network, accounts),
        await setPools(3, deployer, network, accounts),
        await setPools(6, deployer, network, accounts)
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