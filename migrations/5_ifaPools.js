// ============ Contracts ============
// Content:
// 1. IFAGovernorAlpha
// 2. IFATimelock
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const IFAPool = artifacts.require('IFAPool');

// params
const publicContractAddr = {
    'iETH': "0x600B3132Bb97aA7D1D6bE574e8a4AF693A959dAF",
    'iBTC': "0x638D8bc5cB98194c90DECF8aA6Faf10403b45C0A",
    'iUSD': "0x4935773025eAC3dC8ce4258077E2257F1d70C206",
    'wETH': "0x7A530768CddbBB3FE9Ac7D7A174aAF44922af19d",
    'IFA': "0x53B60d54581957106a21Fe963142E537CF99c7dB",
    'uniswapV2Factory': "0x676E9eA0f226948A9c52284e67e812e7D66AF7a3",
    'uniswapV2Router': "0x6764568DbaDd6ED94FB21d5B5B102d50B805310a",
}

// Elastic token addresses are immutable once set, and the list may grow:
K_MADE_iUSD = 0;
K_MADE_iBTC = 1;
K_MADE_iETH = 2;

// Strategy addresses are mutable:
// seed token pool use
K_STRATEGY_CREATE_IFA = 0;
// seed lp token pool use
K_STRATEGY_SHARE_REVENUE = 1;

// Calculator addresses are mutable ( borrow use )
K_CALCULATOR_sCRV = 0;
K_CALCULATOR_btcCRV = 1;
K_CALCULATOR_wETH = 2;


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
