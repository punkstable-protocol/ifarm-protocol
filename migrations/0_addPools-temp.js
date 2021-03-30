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

const allContract = require("../deployedContract.json")

// contract address env
const net = {
    "bnbmainnet": "bnbmainnet",
    "rinkeby": "rinkeby",
    "remote": "remote"
}
const currentNet = net.rinkeby


const poolInfo = {
    0: {
        "name": "BirrCastle",
        "allocPoint": 1,
        "seedToken": "USDT",
        "borrow": true,
        "borrowParams": {
            "calculatorId": 0,
            "kMadeId": 0,
            "rate": 500,
            "minimumLTV": 65,
            "maxmumLTV": 90,
            "minimumSize": 500 * 1e18,
            "borrowToken": "rUSD"
        }
    },
    1: {
        "name": "Sunnylands",
        "allocPoint": 1,
        "seedToken": "BTC",
        "borrow": true,
        "borrowParams": {
            "calculatorId": 1,
            "kMadeId": 1,
            "rate": 600,
            "minimumLTV": 75,
            "maxmumLTV": 90,
            "minimumSize": 0.05 * 1e18,
            "borrowToken": "rBTC"
        }
    },
    2: {
        "name": "ChateauLafitte",
        "allocPoint": 1,
        "seedToken": "ETH",
        "borrow": true,
        "borrowParams": {
            "calculatorId": 2,
            "kMadeId": 2,
            "rate": 550,
            "minimumLTV": 70,
            "maxmumLTV": 90,
            "minimumSize": 1e18,
            "borrowToken": "rETH"
        }
    },
    3: {
        "name": "AdareManor",
        "allocPoint": 5,
        "seedToken": "rUSD_USDT",
        "borrow": false,
        "borrowParams": {}
    },
    4: {
        "name": "VillaDEste",
        "allocPoint": 5,
        "seedToken": "rUSD_BTC",
        "borrow": false,
        "borrowParams": {}
    },
    5: {
        "name": "VillaLant",
        "allocPoint": 5,
        "seedToken": "rUSD_ETH",
        "borrow": false,
        "borrowParams": {}
    },
    6: {
        "name": "VillaFarnese",
        "allocPoint": 50,
        "seedToken": "RICE_rUSD",
        "borrow": false,
        "borrowParams": {}
    },
    7: {
        "name": "ChatsworthHouse",
        "allocPoint": 50,
        "seedToken": "RICE_rBTC",
        "borrow": false,
        "borrowParams": {}
    },
    8: {
        "name": "ChatsworthHouse",
        "allocPoint": 50,
        "seedToken": "RICE_rETH",
        "borrow": false,
        "borrowParams": {}
    }
}

let IFAVaultContract = {
    'BirrCastle': BirrCastle,
    'Sunnylands': Sunnylands,
    'ChateauLafitte': ChateauLafitte,
    'AdareManor': AdareManor,
    'VillaDEste': VillaDEste,
    'VillaLant': VillaLant,
    'VillaFarnese': VillaFarnese,
    'ChatsworthHouse': ChatsworthHouse,
    'ChateauMargaux': ChateauMargaux
}

// Whether to enable the pool
const POOL_ENABLE_STATUS = {
    0: false,       // pool 1
    1: true,        // pool 2
    2: false,       // pool 3
    3: false,       // pool 4
    4: true,        // pool 5
    5: false,       // pool 6
    6: false,       // pool 7
    7: true,        // pool 8
    8: false        // pool 9
}



let resultContract = {}
function logContractAddress(_name, _address) {
    resultContract[_name] = _address
    console.log(`${_name}: ${_address}`)
}


// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }
    const contract = allContract[network]
    this.tokens = {
        "rETH": contract.itokensAddress.rETH,
        "rBTC": contract.itokensAddress.rBTC,
        "rUSD": contract.itokensAddress.rUSD,
        "USDT": contract.tokensAddress.HUSD,
        "BTC": contract.tokensAddress.HBTC,
        "ETH": contract.tokensAddress.HETH,
        "rUSD_USDT": contract.lpTokenAddress.rUSD_USDT,
        "rBTC_BTC": contract.lpTokenAddress.rBTC_HBTC,
        "rETH_ETH": contract.lpTokenAddress.rETH_HETH,
        "RICE_rUSD": contract.lpTokenAddress.RICE_rUSD,
        "RICE_rBTC": contract.lpTokenAddress.RICE_rBTC,
        "RICE_rETH": contract.lpTokenAddress.RICE_rETH
    }
    this.ifaMasterInstance = await IFAMaster.at(contract.public.IFAMaster);
    this.ifaBankInstance = await IFABank.at(contract.public.IFABank);
    this.ifaPoolInstance = await IFAPool.at(contract.public.IFAPool);
    this.createIFAInstance = await CreateIFA.at(contract.public.CreateIFA);

    await Promise.all([
        await addPoolContracts(deployer, network, accounts)
    ]);
};

module.exports = migration;

async function addPoolContracts(deployer, network, accounts) {
    for (let key in poolInfo) {
        if (!POOL_ENABLE_STATUS[key]) {
            continue
        }
        let poolId = key
        let pool = poolInfo[poolId]
        let vaultInstance = null
        // borrow pool
        if (pool.borrow) {
            let K_CALCULATOR = pool.borrowParams.calculatorId
            let K_MADE = pool.borrowParams.kMadeId
            let borrowTokenAddress = this.tokens[pool.borrowParams.borrowToken]
            let rToken = new web3.eth.Contract(iTokenDelegator.abi, borrowTokenAddress)
            // set rTokens
            switch (K_CALCULATOR) {
                case 0:
                    await this.ifaMasterInstance.setiUSD(borrowTokenAddress);
                    await this.ifaMasterInstance.setiToken(K_MADE, borrowTokenAddress);
                    break;
                case 1:
                    await this.ifaMasterInstance.setiBTC(borrowTokenAddress);
                    await this.ifaMasterInstance.setiToken(K_MADE, borrowTokenAddress);
                    break;
                case 2:
                    await this.ifaMasterInstance.setiETH(borrowTokenAddress);
                    await this.ifaMasterInstance.setiToken(K_MADE, borrowTokenAddress);
                    break;
                default:
                    console.log(`Error: set rToken fail pool_id = ${i}`)
                    break;
            }
            await rToken.methods._setBanker(this.ifaBankInstance.address).send({ from: accounts[0] });
            let basicCalculator = await BasicCalculator.new(
                this.ifaMasterInstance.address,
                poolInfo.borrowParams.rate,
                poolInfo.borrowParams.minimumLTV,
                poolInfo.borrowParams.maxmumLTV,
                poolInfo.borrowParams.minimumSize
            )
            await this.ifaMasterInstance.addCalculator(K_CALCULATOR, basicCalculator.address);
            vaultInstance = await IFAVaultContract[pool.name].new(this.ifaMasterInstance.address, this.createIFAInstance.address)
            await this.ifaMasterInstance.addVault(poolId, vaultInstance.address);
            logContractAddress(`${pool.name}Calculators`, basicCalculator.address)
        }

        // seed pool
        let seedTokenAddress = this.tokens[pool.seedToken]
        let allocPoint = pool.allocPoint
        if (!vaultInstance) {
            vaultInstance = await vault.new(this.ifaMasterInstance.address, this.createIFAInstance.address, contract.public.ShareRevenue)
            await this.ifaMasterInstance.addVault(poolId, vaultInstance.address);
        }
        await this.createIFAInstance.setPoolInfo(poolId, vaultInstance.address, seedTokenAddress, allocPoint, false)
        logContractAddress(`${pool.name}`, vaultInstance.address)
        logContractAddress(`${pool.seedToken}`, seedTokenAddress)
    }
}