// ============ Contracts ============
// Content:
// 1. IFAGovernorAlpha
// 2. IFATimelock
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const IFAPool = artifacts.require('IFAPool');

// Token
// deployed first
const MockERC20 = artifacts.require('MockERC20');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');

// IFAPool
const BirrCastle = artifacts.require('BirrCastle');

// Contract address
let contractAddress = {};

function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
}

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
    await Promise.all([
        deloysCRV(deployer, network, accounts),
        deployBirrCastlePool(deployer, network, accounts),
    ]);
    console.log(contractAddress);
};

module.exports = migration;

// ============ Deploy Functions ============
// This is split across multiple files so that
// if the web3 provider craps out, all progress isn't lost.
//
// This is at the expense of having to do 6 extra txs to sync the migrations
// contract

async function deloysCRV(deployer, network, accounts) {
    let totalSupply = toWei('210000');
    this.sCRV = await MockERC20.new('Fake Wrapped sCRV', 'sCRV', totalSupply, { from: accounts[0] });
    for (i = 1; i < accounts.length; i++) {
        await this.sCRV.transfer(accounts[i], toWei('1000'), { from: accounts[0] });
    }
    contractAddress['sCRV'] = this.sCRV.address;
}

async function deployBirrCastlePool(deployer, network, accounts) {
    const POOL_ID = 0;
    const ALLOC_POINT = 100;
    this.pool = await IFAPool.new({ from: accounts[0] });
    this.ifaMaster = await IFAMaster.new({ from: accounts[0] });
    await this.ifaMaster.setsCRV(this.sCRV.address);
    await this.ifaMaster.setPool(this.pool.address);

    this.ifa = await IFAToken.new({ from: accounts[0] });
    await this.ifaMaster.setIFA(this.ifa.address);

    this.createIFA = await CreateIFA.new(this.ifaMaster.address, { from: accounts[0] });
    await this.ifa.addMinter(this.createIFA.address);

    this.costco = await Costco.new(this.ifaMaster.address, { from: accounts[0] });
    await this.ifaMaster.setCostco(this.costco.address);

    this.ifaDataBoard = await IFADataBoard.new(this.ifaMaster.address, { from: accounts[0] });

    this.birrCastlePool = await BirrCastle.new(this.ifaMaster.address, this.ifa.address);

    await this.birrCastlePool.setStrategies([this.createIFA.address,]);
    await this.ifaMaster.addVault(0, this.birrCastlePool.address);
    await this.pool.setPoolInfo(POOL_ID, this.sCRV.address, this.birrCastlePool.address, 1602759206);
    await this.createIFA.setPoolInfo(POOL_ID, this.birrCastlePool.address, this.ifa.address, ALLOC_POINT, true);
    await this.createIFA.approve(this.sCRV.address, { from: accounts[0] });
    contractAddress['pool'] = this.pool.address;
    contractAddress['ifaMaster'] = this.ifaMaster.address;
    contractAddress['ifa'] = this.ifa.address;
    contractAddress['createIFA'] = this.createIFA.address;
    contractAddress['costco'] = this.costco.address;
    contractAddress['ifaDataBoard'] = this.ifaDataBoard.address;
    contractAddress['birrCastlePool'] = this.pool.address;
}
