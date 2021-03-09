const { expectRevert, time, constants, ether } = require('@openzeppelin/test-helpers');
const { inTransaction } = require('@openzeppelin/test-helpers/src/expectEvent');
const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const MockERC20 = artifacts.require('MockERC20');
const BirrCastle = artifacts.require('BirrCastle');
const IFAVault = artifacts.require("IFAVault");
const BN = web3.utils.BN;

function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
}

contract('IFA Pool', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const poolMap = {};
    const VAULT_BY_KEY = 0;
    poolMap['BirrCastle'] = 0;
    this.allocPoint = 100;
    this.decimals = new BN((10 ** 18).toString());
    this.IFA_PER_BLOCK = toWei('10');
    this.PER_SHARE_SIZE = new BN((10 ** 12).toString());

    const getValuePerShare = (_multiplier, _shareAmount, _allocPoint = 100, _totalAllocPoint = 100) => {
        let allReward = Math.floor(_multiplier * this.IFA_PER_BLOCK * _allocPoint / _totalAllocPoint);
        let farmerReward = Math.floor(allReward - allReward * 0.5);
        let valuePerShare = Math.floor(farmerReward * this.PER_SHARE_SIZE / _shareAmount);
        return valuePerShare;
    }

    const updateReward = (_balanceOf, _valuePerShare, _debts = 0) => {
        let rewards = Math.floor(_balanceOf * _valuePerShare / this.PER_SHARE_SIZE - _debts);
        return rewards;
    }

    const getMultiplier = async (_latestBlock, _blockNum = null) => {
        let blockNum = await time.latestBlock();
        if (_blockNum) {
            blockNum = _blockNum;
        }
        return blockNum * 1 - _latestBlock * 1;
    }

    beforeEach(async () => {
        // Fake Wrapped amount 200000 ether, decimals 18
        let totalSupply = toWei('200000');
        this.sCRV = await MockERC20.new('Fake Wrapped sCRV', 'sCRV', totalSupply, { from: alice });
        //from alice transfer sCRV 100 ether to bob and carol
        await this.sCRV.transfer(bob, toWei('100'), { from: alice });
        await this.sCRV.transfer(carol, toWei('100'), { from: alice });
        await this.sCRV.transfer(breeze, toWei('100'), { from: alice });
        await this.sCRV.transfer(joy, toWei('100'), { from: alice });
        await this.sCRV.transfer(weifong, toWei('100'), { from: alice });
        await this.sCRV.transfer(mickjoy, toWei('100'), { from: alice });
        await this.sCRV.transfer(vk, toWei('100'), { from: alice });
        await this.sCRV.transfer(atom, toWei('100'), { from: alice });
        await this.sCRV.transfer(jk, toWei('100'), { from: alice });

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

        this.ifaDataBoard = await IFADataBoard.new(this.ifaMaster.address, { from: alice });

        this.birrCastlePool = await BirrCastle.new(this.ifaMaster.address, this.ifa.address);

        await this.birrCastlePool.setStrategies([this.createIFA.address,]);
        await this.ifaMaster.addVault(VAULT_BY_KEY, this.birrCastlePool.address);
        await this.pool.setPoolInfo(poolMap.BirrCastle, this.sCRV.address, this.birrCastlePool.address, 1602759206);
        await this.createIFA.setPoolInfo(poolMap.BirrCastle, this.birrCastlePool.address, this.ifa.address, this.allocPoint, true);
        await this.createIFA.approve(this.sCRV.address, { from: alice });
    });

    context('Only harvest without exit', async () => {
        it('Single user', async () => {
            let amount = toWei('10')

            await this.sCRV.approve(this.pool.address, amount, { from: bob });

            await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });
            let lastRewardBlock = await time.latestBlock();
            await time.advanceBlock(); // block + 1

            await this.pool.claim(poolMap.BirrCastle, { from: bob });

            let multiplier = await getMultiplier(lastRewardBlock)

            let valuePerShare = getValuePerShare(multiplier, amount);
            let expectedEarned = updateReward(amount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(bob, { from: bob });
            assert.equal(expectedEarned, ifaReward.valueOf());
        });

        it.skip('Single user mul seed', async () => {

        });

        it('Multiple users', async () => {
            let amount = toWei('10')

            // First user
            await this.sCRV.approve(this.pool.address, amount, { from: bob });
            let lastRewardBlock = await time.latestBlock();

            await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });

            await time.advanceBlock(); // block + 1

            let multiplier = await getMultiplier(lastRewardBlock);

            await this.pool.claim(poolMap.BirrCastle, { from: bob });
            let valuePerShare = getValuePerShare(multiplier, amount);
            let expectedReward = updateReward(amount, valuePerShare);
            let ifaReward = await this.ifa.balanceOf(bob, { from: bob });
            assert.equal(expectedReward, ifaReward.toString());

            // Second user
            let twoAmount = toWei('20')
            lastRewardBlock = await time.latestBlock();
            await this.sCRV.approve(this.pool.address, twoAmount, { from: carol });
            await this.pool.deposit(poolMap.BirrCastle, twoAmount, { from: carol });

            lastRewardBlock = await time.latestBlock();
            await this.pool.claim(poolMap.BirrCastle, { from: carol });

            multiplier = await getMultiplier(lastRewardBlock);

            // console.log('claim multiplier:' + multiplier.toString());
            valuePerShare = getValuePerShare(multiplier, toWei('30'));
            expectedReward = updateReward(twoAmount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(carol, { from: carol });
            assert.equal(expectedReward, ifaReward.toString());
        });
    });

    context('deposit a few blocks after pledge and exit', async () => {
        it('Single user', async () => {
            let amount = toWei('10')
            let advanceBlockNum = 1;
            await this.sCRV.approve(this.pool.address, amount, { from: bob });
            await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });
            let lastRewardBlock = await time.latestBlock();

            await time.advanceBlock(); // block + 1

            await this.pool.withdraw(poolMap.BirrCastle, amount, { from: bob });
            let multiplier = await getMultiplier(lastRewardBlock);
            let valuePerShare = getValuePerShare(multiplier, toWei('10'));
            let expectedReward = updateReward(amount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(bob, { from: bob });
            assert.equal(expectedReward, ifaReward.toString());
        });

        it('Multiple users', async () => {
            //Multiple users quit after pledged separately
            let amount = toWei('10')

            await this.sCRV.approve(this.pool.address, amount, { from: bob });
            await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });
            let lastRewardBlock = await time.latestBlock();

            await time.advanceBlockTo(lastRewardBlock.toNumber() + 1);

            await this.pool.withdraw(poolMap.BirrCastle, amount, { from: bob });
            let multiplier = await getMultiplier(lastRewardBlock);
            let valuePerShare = getValuePerShare(multiplier, toWei('10'));
            let expectedReward = updateReward(amount, valuePerShare);
            let ifaReward = await this.ifa.balanceOf(bob, { from: bob });
            assert.equal(expectedReward, ifaReward.toString());

            // user two
            let twoAmount = toWei('10')
            lastRewardBlock = await time.latestBlock();
            await this.sCRV.approve(this.pool.address, twoAmount, { from: carol });
            await this.pool.deposit(poolMap.BirrCastle, twoAmount, { from: carol });

            await this.pool.withdraw(poolMap.BirrCastle, twoAmount, { from: carol });
            multiplier = await getMultiplier(lastRewardBlock);

            valuePerShare = getValuePerShare(multiplier, toWei('10'));
            expectedReward = updateReward(twoAmount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(carol);
            assert.equal(expectedReward, ifaReward.toString());
        });
    });

    context('Exit after harvest', async () => {
        it('Single user', async () => {
            let amount = toWei('10');
            await this.sCRV.approve(this.pool.address, amount, { from: bob });
            await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });
            let lastRewardBlock = await time.latestBlock();
            await time.advanceBlockTo(lastRewardBlock.toNumber() + 1);

            // claim
            await this.pool.claim(poolMap.BirrCastle, { from: bob });
            let multiplier = await getMultiplier(lastRewardBlock)
            let valuePerShare = getValuePerShare(multiplier, amount);
            let expectedEarned = updateReward(amount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(bob, { from: bob });
            assert.equal(expectedEarned, ifaReward.valueOf());

            // exit
            await time.advanceBlock();  // block +1
            await this.pool.withdraw(poolMap.BirrCastle, amount, { from: bob });
            multiplier = await getMultiplier(lastRewardBlock);
            valuePerShare = getValuePerShare(multiplier, amount);
            expectedReward = updateReward(amount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(bob);
            assert.equal(expectedReward, ifaReward.toString());
        });

        it('Multiple users', async () => {
            // user one deposit
            let amount = toWei('10');
            await this.sCRV.approve(this.pool.address, amount, { from: bob });
            await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });
            let lastRewardBlock = await time.latestBlock();
            await time.advanceBlockTo(lastRewardBlock.toNumber() + 1);

            // user one claim
            await this.pool.claim(poolMap.BirrCastle, { from: bob });
            let multiplier = await getMultiplier(lastRewardBlock)
            let valuePerShare = getValuePerShare(multiplier, amount);
            let expectedEarned = updateReward(amount, valuePerShare);
            let ifaReward = await this.ifa.balanceOf(bob, { from: bob });
            assert.equal(expectedEarned, ifaReward.valueOf());

            // user two deposit
            lastRewardBlock = await time.latestBlock();
            let twoAmount = toWei('20');
            await this.sCRV.approve(this.pool.address, twoAmount, { from: carol });
            await this.pool.deposit(poolMap.BirrCastle, twoAmount, { from: carol });
            // multiplier = await getMultiplier(lastRewardBlock);
            // valuePerShare = getValuePerShare(multiplier, amount * 1 + twoAmount * 1);
            // let twoReward = updateReward(twoAmount, valuePerShare);

            // user two exit
            // lastRewardBlock = await time.latestBlock();
            await this.pool.withdraw(poolMap.BirrCastle, twoAmount, { from: carol });
            multiplier = await getMultiplier(lastRewardBlock);
            valuePerShare = getValuePerShare(multiplier, amount * 1 + twoAmount * 1);
            expectedReward = updateReward(twoAmount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(carol);
            assert.equal(expectedReward, ifaReward.toString());

            // user one exit
            lastRewardBlock = await time.latestBlock();
            await this.pool.withdraw(poolMap.BirrCastle, amount, { from: bob });
            multiplier = await getMultiplier(lastRewardBlock);
            valuePerShare = getValuePerShare(multiplier, amount);
            expectedReward = updateReward(amount, valuePerShare);
            ifaReward = await this.ifa.balanceOf(bob);
            assert.equal(expectedReward, ifaReward.toString());
        });
    });

    context('Withdraw part of the deposit', async () => {

    });

});

contract('pool Over-limit mining', ([alice, bob, breeze]) => {
    before(async () => {
        this.usdt = await MockERC20.at("0x73DF1b8c7fdb09B1924e2e83945613d7AAd05f2C")
        this.rice = await IFAToken.at("0x7EE0ad7205e14504737401AdD17B17D71719a2a1")
        this.ifaPool = await IFAPool.at("0x062fDE77DA88B3469a9DC1b4BA82fe1b1BcAcf9D")
        this.birrCastleVault = await IFAVault.at("0x414FC6bEb4d77D7B9E4819b396f5C0E6Af4b3692")
        this.createIFA = await CreateIFA.at("0xd41Df588a967708C158F5084ef6E3004279eB708")
    })

    it.only('seed usdt chaim rusd', async () => {
        let endBlock = await this.createIFA.endBlock()
        let startBlock = await this.createIFA.startBlock()
        console.log(startBlock.toString())
        console.log(endBlock.toString())

        await this.usdt.approve(this.ifaPool.address, constants.MAX_UINT256)
        let riceBalance = await this.rice.balanceOf(alice)
        let blockNum = await time.latestBlock().then((result) => { console.log(`1 deposit before block:${result}`); return result })
        await this.ifaPool.deposit(0, ether('1'))
        let seedAmount = await this.birrCastleVault.balanceOf(alice)
        await this.ifaPool.withdraw(0, seedAmount)
        console.log(`Reward:${(await this.rice.balanceOf(alice)) - riceBalance}`)
        console.log(`====================================\n`)

        await time.latestBlock().then((result) => { console.log(`2 deposit before block:${result}`) })
        riceBalance = await this.rice.balanceOf(alice)
        await this.ifaPool.deposit(0, ether('1'))
        seedAmount = await this.birrCastleVault.balanceOf(alice)


        await time.advanceBlockTo(`${blockNum.toNumber() + 200}`)

        await this.ifaPool.withdraw(0, seedAmount)
        console.log(`Reward:${(await this.rice.balanceOf(alice)) - riceBalance}`)
        console.log(`====================================\n`)

        riceBalance = await this.rice.balanceOf(alice)
        await time.latestBlock().then((result) => { console.log(`3 deposit before block:${result}`) })
        await this.ifaPool.deposit(0, ether('1'))
        seedAmount = await this.birrCastleVault.balanceOf(alice)
        await this.ifaPool.withdraw(0, seedAmount)
        console.log(`Reward:${(await this.rice.balanceOf(alice)) - riceBalance}`)
    })
})