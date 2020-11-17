const { expectRevert, time } = require('@openzeppelin/test-helpers');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const MockERC20 = artifacts.require('MockERC20');
const BirrCastle = artifacts.require('BirrCastle');
const BN = web3.utils.BN;

function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
}

contract('Costco', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const poolMap = {};
    const VAULT_BY_KEY = 0;
    poolMap['BirrCastle'] = 0;
    this.allocPoint = 100;
    this.decimals = new BN((10 ** 18).toString());
    this.IFA_PER_BLOCK = toWei('10');
    this.PER_SHARE_SIZE = new BN((10 ** 12).toString());

    beforeEach(async () => {
        // Fake Wrapped amount 200000 ether, decimals 18
        let totalSupply = toWei('200000');
        this.sCRV = await MockERC20.new('Fake Wrapped sCRV', 'sCRV', totalSupply, { from: alice });
        this.iETH = await MockERC20.new('Fake Wrapped iETH', 'iETH', totalSupply, { from: alice })
        //from alice transfer sCRV 100 ether to bob and carol
        await this.sCRV.transfer(bob, toWei('100'), { from: alice });
        await this.sCRV.transfer(carol, toWei('100'), { from: alice });
        await this.iETH.transfer(bob, toWei('100'), { from: alice });

        this.pool = await IFAPool.new({ from: alice });

        this.ifaMaster = await IFAMaster.new({ from: alice });
        await this.ifaMaster.setsCRV(this.sCRV.address);
        await this.ifaMaster.setPool(this.pool.address);

        this.ifa = await IFAToken.new({ from: alice });
        await this.ifaMaster.setIFA(this.ifa.address);

        this.createIFA = await CreateIFA.new(this.ifaMaster.address, { from: alice });
        await this.ifa.addMinter(this.createIFA.address);

        this.costco = await Costco.new(this.ifaMaster.address, { from: alice });
        await this.ifaMaster.setCostco(this.costco.address);
        await this.iETH.approve(this.costco.address, toWei('90000000'));
        await this.ifa.approve(this.costco.address, toWei('90000000'));

        this.ifaDataBoard = await IFADataBoard.new(this.ifaMaster.address, { from: alice });

        this.birrCastlePool = await BirrCastle.new(this.ifaMaster.address, this.ifa.address);

        await this.birrCastlePool.setStrategies([this.createIFA.address,]);
        await this.ifaMaster.addVault(VAULT_BY_KEY, this.birrCastlePool.address);
        await this.pool.setPoolInfo(poolMap.BirrCastle, this.sCRV.address, this.birrCastlePool.address, 1602759206);
        await this.createIFA.setPoolInfo(poolMap.BirrCastle, this.birrCastlePool.address, this.ifa.address, this.allocPoint, true);
        await this.createIFA.approve(this.sCRV.address, { from: alice });

        // harvest IFA， 50% goes to costco
        let amount = toWei('100')
        await this.sCRV.approve(this.pool.address, amount, { from: bob });
        await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });
        let lastBlockNum = await time.latestBlock();
        await time.advanceBlockTo(lastBlockNum.add(new BN(100))); // block + 100
        await this.pool.claim(poolMap.BirrCastle, { from: bob });
    });

    it('Anyone can buy IFA by iToken with 5% discount', async () => {
        let IFAbalanceOf = await this.ifa.balanceOf(bob);
        let iETHBalanceOf = await this.iETH.balanceOf(bob);
        console.log(`IFAbalanceOf:${IFAbalanceOf.toString()}`);
        console.log(`iETHBalanceOf:${iETHBalanceOf.toString()}`);
        await this.costco.buyIFAWithiToken(this.iETH.address, toWei('1'), { from: bob });
        iETHBalanceOf = await this.iETH.balanceOf(bob);
        console.log(`iETHBalanceOf:${iETHBalanceOf.toString()}`);
    });

});