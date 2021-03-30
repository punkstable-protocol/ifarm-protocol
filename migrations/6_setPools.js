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
    9: 'Chillon',
    10: 'Frederiksborg',
    11: 'Prague'
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
    9: "BNB_rUSD",
    10: "BNB_rBTC",
    11: "BNB_rETH"
}


// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }
    const contract = allContract[network]
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
        'Chillon': contract.poolVaults.Chillon,
        'Frederiksborg': contract.poolVaults.Frederiksborg,
        'Prague': contract.poolVaults.Prague
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
        "RICE-rETH": contract.lpTokenAddress.RICE_rETH,
        "BNB_rUSD": contract.lpTokenAddress.BNB_rUSD,
        "BNB_rBTC": contract.lpTokenAddress.BNB_rBTC,
        "BNB_rETH": contract.lpTokenAddress.BNB_rETH
    }
    this.Calculators = [
        CalculatorAddress.BirrCastleCalculator,
        CalculatorAddress.SunnylandsCalculator,
        CalculatorAddress.ChateauLafitteCalculator
    ]

    this.getTokensAddress = (_id) => {
        return tokensAddress[tokensId[_id]]
    }

    this.getPoolVaultAddress = (_id) => {
        return poolVaultAddress[poolVaultId[_id]]
    }

    this.getiTokenAddress = (_id) => {
        let item = [
            iTokenAddress.rUSD,
            iTokenAddress.rBTC,
            iTokenAddress.rETH
        ]
        return item[_id]
    }

    console.log(ifaBankAddress, ifaPoolAddress)
    console.log(CalculatorAddress)
    console.log(poolVaultAddress)
    console.log(iTokenAddress)
    console.log(tokensAddress)
    console.log(this.Calculators)

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
        await this.ifaBankInstance.setPoolInfo(poolId, this.getiTokenAddress(poolId), this.getPoolVaultAddress(poolId), this.Calculators[poolId]);
    }
    console.log(`Start setting ifa pool...`)
    await this.ifaPoolInstance.setPoolInfo(poolId, this.getTokensAddress(poolId), this.getPoolVaultAddress(poolId), now);
    console.log(`---------- Pool ${poolId + 1} Set successfully----------------\n`)
}