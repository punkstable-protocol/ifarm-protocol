// config
const poolsInfo = require("./config/poolsInfo")
const contractModels = require("./config/contractModel")
const fs = require("fs")

// public
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');

// all pool vaults,total:24
const vaultsContractList = fs.readdirSync("../contracts/tokens/vaults/")
const IFAVaultContractItem = {}
for (let i = 0; i < vaultsContractList.length; i++) {
    let vaultName = vaultsContractList[i].split('.')[0]
    IFAVaultContractItem[vaultName] = artifacts.require(vaultName);
}

// Whether to enable the pool
const enablePoolsId = [21, 22, 23]


// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }
    this.contractsAddr = contractModels.formatAddress(network)
    this.ifaBankInstance = await IFABank.at(this.contractsAddr.IFABank);
    this.ifaPoolInstance = await IFAPool.at(this.contractsAddr.IFAPool);
    await Promise.all([
        setPools()
    ]);
};

module.exports = migration;

async function setPools() {
    for (let key in poolsInfo) {
        if (enablePoolsId.indexOf(key * 1) == -1) {
            continue
        }
        let poolId = key
        let pool = poolsInfo[poolId]
        let vaultName = pool.name
        let vaultAddress = this.contractsAddr[vaultName]
        let now = Math.floor((new Date()).getTime() / 1000 - 3600)
        let calculatorName = pool.borrowParams.calculatorName
        let calculatorAddress = this.contractsAddr[calculatorName]
        // borrow pool
        if (pool.borrow) {
            console.log(`Start setting ${calculatorName} ifaBank pool...`)
            let borrowSymbol = pool.borrowParams.borrowToken
            let borrowTokenAddress = this.contractsAddr[borrowSymbol]
            await this.ifaBankInstance.setPoolInfo(poolId, borrowTokenAddress, vaultAddress, calculatorAddress);
        }

        // seed pool
        console.log(`Start setting ${vaultName} pool...`)
        let seedSymbol = pool.seedToken
        let seedTokenAddress = this.contractsAddr[seedSymbol]
        await this.ifaPoolInstance.setPoolInfo(poolId, seedTokenAddress, vaultAddress, now);
        console.log(`--- PoolID: ${poolId}  poolName: ${vaultName} Set successfully ---\n`)
    }
}