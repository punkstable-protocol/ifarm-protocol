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

contract('Birr Castle Pool', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const POOL_ID = 0;

    before(async () => {
        this.decimals = new BN((10 ** 18).toString());
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
        const VAULT_BY_KEY = 0;
        this.allocPoint = 100;
        await this.birrCastlePool.setStrategies([this.createIFA.address,]);
        await this.ifaMaster.addVault(VAULT_BY_KEY, this.birrCastlePool.address);
        await this.pool.setPoolInfo(POOL_ID, this.sCRV.address, this.birrCastlePool.address, 1602759206);
        await this.createIFA.setPoolInfo(POOL_ID, this.birrCastlePool.address, this.ifa.address, this.allocPoint, true);
        await this.createIFA.approve(this.sCRV.address, { from: alice });
    });

    context('seed of token or lp token harvest IFA', async () => {
        this.IFA_PER_BLOCK = toWei('10');
        this.PER_SHARE_SIZE = new BN((10 ** 12).toString());
        this.createIFABalanceOfTotal = new BN(0);

        // Do not exit the pledge user
        // let accounts = [bob, carol, breeze, joy, weifong];
        let accounts = [bob, carol, breeze];

        // Exit staking users
        let accounts_exit = [weifong, mickjoy, vk, atom, jk];
        // let depositAmounts = ['10', '15', '23', '32', '11'];
        // let exitDepositAmounts = ['10', '15', '23', '32', '11'];

        let depositAmounts = ['10', '10', '10'];
        let exitDepositAmounts = ['10', '9', '10'];
        this.valuePerShare = 0;

        for (let i = 0; i < accounts.length; i++) {
            blockNum = i + 1;
            // it(`from ${accounts[i]} deposit ${depositAmounts[i]} sCRV advanceBlock ${blockNum}`, async () => {
            //     let depositBefore = await this.sCRV.balanceOf(accounts[i]);
            //     // deposit amount
            //     this.depositAmount = toWei(depositAmounts[i]);
            //     await this.sCRV.approve(this.pool.address, this.depositAmount, { from: accounts[i] });
            //     await this.pool.deposit(0, this.depositAmount, { from: accounts[i] });

            //     this.createIFABalanceOfTotal = this.createIFABalanceOfTotal.add(new BN(this.depositAmount));

            //     let depositBlock = await time.latestBlock();

            //     // deposit after accounts[i] account balanceOf
            //     let depositAfterBalanceOf = await this.sCRV.balanceOf(accounts[i]);
            //     let amountInVault = await this.birrCastlePool.totalSupply();

            //     // Whether the pledge successfully transfers user assets into the contract
            //     assert.equal(depositBefore.sub(depositAfterBalanceOf), toWei(depositAmounts[i]), 'The amount of pledge is incorrect');
            //     assert.equal(await this.birrCastlePool.balanceOf(accounts[i]), this.depositAmount, 'Wrong number of equity token');

            //     this.advanceBlockNum = blockNum;
            //     await time.advanceBlockTo(depositBlock.toNumber() + this.advanceBlockNum);

            //     let pendingReward = await this.birrCastlePool.getPendingReward(accounts[i], 0);

            //     // Manual checking calculation rules
            //     let totalAllocPoint = this.allocPoint;
            //     let ifaReward = Math.floor(this.advanceBlockNum * this.IFA_PER_BLOCK * this.allocPoint / totalAllocPoint);
            //     ifaReward = Math.floor(ifaReward - ifaReward / 2);
            //     let pending = Math.floor(ifaReward * this.PER_SHARE_SIZE / amountInVault);
            //     manualPendingReward = Math.floor(this.depositAmount * pending / this.PER_SHARE_SIZE);

            //     // pendingReward assert
            //     assert.equal(pendingReward.toString(), manualPendingReward, 'pendingReward Calculation error');
            // });

            // it(`harvest IFA to ${accounts[i]}`, async () => {
            //     await this.pool.claim(0, { from: accounts[i] });
            //     let amountInVault = await this.birrCastlePool.totalSupply();
            //     let claimReward = await this.ifa.balanceOf(accounts[i]);

            //     // Manual checking calculation rules
            //     let totalAllocPoint = this.allocPoint;
            //     let ifaReward = Math.floor((this.advanceBlockNum + 1) * this.IFA_PER_BLOCK * this.allocPoint / totalAllocPoint);
            //     ifaReward = Math.floor(ifaReward - ifaReward / 2);
            //     let pending = Math.floor(ifaReward * this.PER_SHARE_SIZE / amountInVault);
            //     manualPendingReward = Math.floor(this.depositAmount * pending / this.PER_SHARE_SIZE);

            //     // 50% is for farmers, 50% goes to the costco.
            //     assert.equal(claimReward.toString(), manualPendingReward, 'claimReward error');

            //     let poolBalanceOf = await this.birrCastlePool.balanceOf(accounts[i]);
            //     assert.equal(poolBalanceOf, this.depositAmount, 'Wrong number of user equity tokens')

            //     let pendingReward = await this.birrCastlePool.getPendingReward(accounts[i], 0);
            //     assert.equal(pendingReward, 0, 'The reward to be harvested should be 0');

            //     let createIFABalanceOf = await this.sCRV.balanceOf(this.createIFA.address);
            //     assert.equal(createIFABalanceOf.toString(), this.createIFABalanceOfTotal.toString(), 'The balance pledged by all users should be the same as the amount locked by createIFA');
            // });

            it(`deposit ${depositAmounts[i]} exit ${exitDepositAmounts[i]} and harvest IFA`, async () => {
                let amount = toWei(depositAmounts[i]);
                let exitAmount = toWei(exitDepositAmounts[i]);

                const getManualValuePerShare = async (multiplier, amountInVault) => {
                    let totalAllocPoint = this.allocPoint
                    let allReward = Math.floor(multiplier * this.IFA_PER_BLOCK * this.allocPoint / totalAllocPoint);
                    let farmerReward = Math.floor(allReward - allReward / 2);
                    valuePerShare = Math.floor(this.valuePerShare + (farmerReward * this.PER_SHARE_SIZE / amountInVault));
                    return valuePerShare;
                };

                let lastRewardBlock = await time.latestBlock();
                console.log('lastRewardBlock:' + lastRewardBlock);
                await this.sCRV.approve(this.pool.address, amount, { from: accounts_exit[i] });

                let amountInVault = await this.birrCastlePool.totalSupply();
                // if (amountInVault > 0) {
                //     console.log('amountInVault > 0:' + amountInVault);
                //     await getManualValuePerShare(2, amountInVault);
                // }

                await this.pool.deposit(POOL_ID, amount, { from: accounts_exit[i] });
                let depositAfterReward = await this.birrCastlePool.rewards(accounts_exit[i],0);
                console.log(depositAfterReward + ' - depositAfterReward');
                let createIFAsCRVBalanceOf = await this.sCRV.balanceOf(this.createIFA.address)
                let blockNum = await time.latestBlock();
                let advanceBlockNum = 1;
                await time.advanceBlockTo(blockNum.toNumber() + advanceBlockNum);
                blockNum = await time.latestBlock();
                console.log('blockNum:' + blockNum);

                let multiplier = i == 0 ? blockNum - lastRewardBlock - 2 : blockNum - lastRewardBlock;
                amountInVault = await this.birrCastlePool.totalSupply();
                let balanceOf = await this.birrCastlePool.balanceOf(accounts_exit[i]);

                //deposit or claim or withdraw after call, amountInVault Equal to 0, no trigger 


                const getManualPendingReward = async (_multiplier, _depositAmount, _balanceOf, _laveValuePerShare = 0) => {
                    console.log(`${_multiplier.toString()} - ${_depositAmount.toString()} - ${_balanceOf.toString()} - ${_laveValuePerShare.toString()}`);
                    let allReward = Math.floor(_multiplier * this.IFA_PER_BLOCK);
                    let farmerReward = Math.floor(allReward - allReward / 2);
                    console.log(farmerReward);
                    let valuePerShare = Math.floor(farmerReward * this.PER_SHARE_SIZE / _depositAmount);
                    console.log(valuePerShare);
                    let pendingReward = Math.floor(_balanceOf * (valuePerShare + _laveValuePerShare) / this.PER_SHARE_SIZE);
                    return pendingReward;
                };

                let pendingReward = await this.birrCastlePool.getPendingReward(accounts_exit[i], 0);
                let manualPendingReward = await getManualPendingReward(multiplier, amount, balanceOf, 0);
                console.log(`${manualPendingReward.toString()} - ${pendingReward.toString()}`);

                await this.pool.withdraw(POOL_ID, exitAmount, { from: accounts_exit[i] });
                blockNum = await time.latestBlock();
                multiplier = i == 0 ? blockNum - lastRewardBlock - 2 : blockNum - lastRewardBlock;

                // console.log('after:'+blockNum.toString());

                console.log(amountInVault.toString());
                let withdrawReward = amount * await getManualValuePerShare(multiplier, amountInVault) / this.PER_SHARE_SIZE;
                console.log(withdrawReward.toString());
                let claimReward = await this.ifa.balanceOf(accounts_exit[i]);
                // 50% is for farmers, 50% goes to the costco.
                assert.equal(claimReward.toString(), withdrawReward.toString(), 'claimReward error');

                let SNAILBalanceOf = await this.birrCastlePool.balanceOf(accounts_exit[i]);
                assert.equal(SNAILBalanceOf, amount - exitAmount, 'Wrong number of user equity tokens')

                let createIFAsCRVBalanceOfAfter = await this.sCRV.balanceOf(this.createIFA.address);
                let balanceOfShould = new BN(createIFAsCRVBalanceOf).sub(new BN(exitAmount));
                assert.equal(createIFAsCRVBalanceOfAfter.toString(), balanceOfShould.toString(), 'The sCRV balance of the createIFA contract should be the pledge amount');

            });

        }

    });

});