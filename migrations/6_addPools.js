// config
const poolsInfo = require("./config/poolsInfo")
const contractModels = require("./config/contractModel")
const fs = require("fs")

// ============ Contracts ============
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");

// public
const IFAMaster = artifacts.require('IFAMaster');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const CreateIFA = artifacts.require('CreateIFA');

// deploy 3
const BasicCalculator = artifacts.require('BasicCalculator')

// all pool vaults,total:21
const vaultsContractList = fs.readdirSync("../contracts/tokens/vaults/")
const IFAVaultContractItem = {}
for (let i = 0; i < vaultsContractList.length; i++) {
    let vaultName = vaultsContractList[i].split('.')[0]
    IFAVaultContractItem[vaultName] = artifacts.require(vaultName);
}

function logDeployedContract(pool, name, address, result = false) {
    if (result) {
        console.log(`\n------  Completed deployment contract address information  ------`)
        for (let key in poolsInfo) {
            if (addPoolIdList.indexOf(key * 1) == -1) {
                continue
            }
            let contractsAddr = poolsInfo[key]['contractsAddr']
            for (let k1 in contractsAddr) {
                console.log(`"${k1}": "${contractsAddr[k1]}",`)
            }
        }
        console.log(`\n`)
    } else {
        pool.contractsAddr[name] = address
        console.log(`${name}: ${address}`)
    }
}


// Contract ID of the pool to be added
const addPoolIdList = [21, 22, 23]


// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }

    this.contractsAddr = contractModels.formatAddress(network)
    this.ifaMasterInstance = await IFAMaster.at(this.contractsAddr.IFAMaster);
    this.ifaBankInstance = await IFABank.at(this.contractsAddr.IFABank);
    this.ifaPoolInstance = await IFAPool.at(this.contractsAddr.IFAPool);
    this.createIFAInstance = await CreateIFA.at(this.contractsAddr.CreateIFA);

    await Promise.all([
        await addPoolContracts(accounts)
    ]);
    logDeployedContract("", "", "", result = true)
};

module.exports = migration;

async function addPoolContracts(accounts) {
    for (let key in poolsInfo) {
        if (addPoolIdList.indexOf(key * 1) == -1) {
            continue
        }
        console.log(`\nStart adding pool ${key}`)
        let poolId = key
        let pool = poolsInfo[poolId]
        let vaultContract = IFAVaultContractItem[pool.name]
        let vaultInstance = null
        // borrow pool
        if (pool.borrow) {
            let K_CALCULATOR = pool.borrowParams.calculatorId
            let K_MADE = pool.borrowParams.kMadeId
            let borrowSymbol = pool.borrowParams.borrowToken
            let borrowTokenAddress = this.contractsAddr[borrowSymbol]
            pool.contractsAddr[borrowSymbol] = borrowTokenAddress
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
                pool.borrowParams.rate.toString(),
                pool.borrowParams.minimumLTV.toString(),
                pool.borrowParams.maxmumLTV.toString(),
                pool.borrowParams.minimumSize.toString()
            )
            await this.ifaMasterInstance.addCalculator(K_CALCULATOR, basicCalculator.address);
            vaultInstance = await vaultContract.new(this.ifaMasterInstance.address, this.createIFAInstance.address)
            await this.ifaMasterInstance.addVault(poolId, vaultInstance.address);
            logDeployedContract(pool, `${pool.name}Calculators`, basicCalculator.address)
        }

        // seed pool
        let seedSymbol = pool.seedToken
        let seedTokenAddress = this.contractsAddr[seedSymbol]
        pool.contractsAddr[seedSymbol] = seedTokenAddress
        let allocPoint = pool.allocPoint.toString()
        if (!vaultInstance) {
            vaultInstance = await vaultContract.new(this.ifaMasterInstance.address, this.createIFAInstance.address, this.contractsAddr.ShareRevenue)
            await this.ifaMasterInstance.addVault(poolId, vaultInstance.address);
        }
        await this.createIFAInstance.setPoolInfo(poolId, vaultInstance.address, seedTokenAddress, allocPoint, false)
        logDeployedContract(pool, `${pool.name}`, vaultInstance.address)
        logDeployedContract(pool, `${pool.seedToken}`, seedTokenAddress)
    }
}