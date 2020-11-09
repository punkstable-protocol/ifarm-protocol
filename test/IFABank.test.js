const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const IFARevenue = artifacts.require('IFARevenue');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const MockERC20 = artifacts.require('MockERC20');
const wETHCalculator = artifacts.require('wETHCalculator');
const ChateauLafitte = artifacts.require('ChateauLafitte');
const BN = web3.utils.BN;
const { newContractAt, newContract } = require('./lib/ContractAction');


function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
}

// approve max amount 90000000000000000000000000

const contractAddress = {
    'iETH': "0x600B3132Bb97aA7D1D6bE574e8a4AF693A959dAF",
    'iBTC': "0x638D8bc5cB98194c90DECF8aA6Faf10403b45C0A",
    'iUSD': "0x4935773025eAC3dC8ce4258077E2257F1d70C206",
    'uniswapV2Factory': "0x676E9eA0f226948A9c52284e67e812e7D66AF7a3",
    'uniswapV2Router': "0x6764568DbaDd6ED94FB21d5B5B102d50B805310a",
    'wETH': "0x7A530768CddbBB3FE9Ac7D7A174aAF44922af19d",
    'IFA': "0x53B60d54581957106a21Fe963142E537CF99c7dB",
}

// Before starting the test, you need to manually deploy the uniswap ifa iETH contract, 
// and add the wETH/IFA and wETH/iETH liquidity to the uniswap routing contract
contract('IFABank', ([alice, bob, carol]) => {
    const POOL_ID = 2;
    this.allocPoint = 100;
    this.decimals = "1000000000000000000";
    this.IFA_PER_BLOCK = toWei('10');
    this.PER_SHARE_SIZE = 1000000000000;

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
        let initTotalSupply = toWei('900000000');
        this.approveMaxAmount = toWei('90000000');
        // create token and iToken
        // this.wETH = await MockERC20.new('Fake Wrapped wETH', 'wETH', initTotalSupply, { from: alice });
        this.wETH = newContractAt.wETH(contractAddress.wETH);
        this.wETH.address = this.wETH.options.address;

        // this.ifa = await IFAToken.new({ from: alice });
        this.ifa = newContractAt.IFA(contractAddress.IFA);
        this.ifa.address = this.ifa.options.address;

        // link iETH contract
        this.iETH = newContractAt.iToken(contractAddress.iETH);
        this.iETH.address = contractAddress.iETH;
        let tokenAddress = {
            'wETH': this.wETH.address,
            'iETH': this.iETH.address,
            'ifa': this.ifa.address
        }

        // init alice token and itoken balance
        // await this.ifa.addMinter(alice, { from: alice });
        // await this.ifa.mint(alice, initTotalSupply, { from: alice });
        // await this.ifa.methods.addMinter(alice).send({ from: alice });
        // await this.ifa.methods.mint(alice, initTotalSupply).send({ from: alice });

        // deploy uniswap contract
        // this.uniswapV2Factory = await newContract.UniswapV2Factory(alice, [alice]);
        // this.uniswapV2Factory.address = this.uniswapV2Factory.options.address;
        // this.uniswapV2Router02 = await newContract.UniswapV2Router02(alice, [this.uniswapV2Factory.address, this.wETH.address]);
        // this.uniswapV2Router02.address = this.uniswapV2Router02.options.address;

        this.uniswapV2Factory = newContractAt.uniswapV2Factory(contractAddress.uniswapV2Factory);
        this.uniswapV2Factory.address = this.uniswapV2Factory.options.address;
        this.uniswapV2Router02 = newContractAt.uniswapV2Router02(contractAddress.uniswapV2Router);
        this.uniswapV2Router02.address = this.uniswapV2Router02.options.address;
        let uniswapAddress = {
            'factoryAddress': this.uniswapV2Factory.address,
            'router02Address': this.uniswapV2Router02.address
        }

        // approve token and itoken ,add liquidity
        let deadline = Math.floor((new Date()).getTime() / 1000 + 3600);
        await this.ifa.methods.approve(this.uniswapV2Router02.address, this.approveMaxAmount).send({ from: alice });
        await this.wETH.methods.approve(this.uniswapV2Router02.address, this.approveMaxAmount).send({ from: alice });
        await this.iETH.methods.approve(this.uniswapV2Router02.address, this.approveMaxAmount).send({ from: alice });

        this.ifaMaster = await IFAMaster.new({ from: alice });
        this.ifaMaster.setUniswapV2Factory(this.uniswapV2Factory.address);
        const iETHTokenKEY = 2;
        this.ifaMaster.setiToken(iETHTokenKEY, contractAddress.iETH);
        await this.ifaMaster.setwETH(this.wETH.address);
        await this.ifaMaster.setIFA(this.ifa.address, { from: alice });

        const K_MADE_iETH = 2;

        this.pool = await IFAPool.new({ from: alice });
        await this.ifaMaster.setPool(this.pool.address, { from: alice });

        this.bank = await IFABank.new(this.ifaMaster.address, { from: alice });
        await this.ifaMaster.setBank(this.bank.address, { from: alice });

        this.revenue = await IFARevenue.new(this.ifaMaster.address, { from: alice });
        await this.ifaMaster.setRevenue(this.revenue.address, { from: alice });

        this.costco = await Costco.new(this.ifaMaster.address, { from: alice });
        await this.ifaMaster.setCostco(this.costco.address, { from: alice });

        this.createIFA = await CreateIFA.new(this.ifaMaster.address, { from: alice });
        // await this.ifa.addMinter(this.createIFA.address, { from: alice });
        await this.ifa.methods.addMinter(this.createIFA.address).send({ from: alice })

        const K_STRATEGY_CREATE_IFA = 0;
        await this.ifaMaster.addStrategy(K_STRATEGY_CREATE_IFA, this.createIFA.address, { from: alice });

        this.chateauLafitte = await ChateauLafitte.new(this.ifaMaster.address, this.createIFA.address, { from: alice });
        const K_VAULT_CHATEAU_LAFITTE = 2;
        await this.ifaMaster.addVault(K_VAULT_CHATEAU_LAFITTE, this.chateauLafitte.address, { from: alice });

        this.calculator = await wETHCalculator.new(this.ifaMaster.address, { from: alice });
        this.RATE_BASE = 1000000;
        this.rate = 500;       // 500 = 0.05% , rage 0 - 10000
        this.minimumLTV = 70;      // At what minimum loan-to-deposit ratio the user lended. rage 10 - 95
        this.maximumLTV = 90;      // At what maximum loan-to-deposit ratio the user lended. rage 15 - 95
        await this.calculator.changeRateAndLTV(this.rate, this.minimumLTV, this.maximumLTV, { from: alice });

        // sCRV:0 btcCRV:1 wETH:2
        const K_CALCULATOR_wETH = 2;

        await this.ifaMaster.addCalculator(K_CALCULATOR_wETH, this.calculator.address, { from: alice });

        const now = Math.floor((new Date()).getTime() / 1000 - 3600);
        // Let the pool start now.
        await this.pool.setPoolInfo(POOL_ID, this.wETH.address, this.chateauLafitte.address, now, { from: alice });
        await this.createIFA.setPoolInfo(POOL_ID, this.chateauLafitte.address, this.wETH.address, this.allocPoint, false, { from: alice });
        await this.bank.setPoolInfo(POOL_ID, this.iETH.address, this.chateauLafitte.address, this.calculator.address, { from: alice });

        // It will works well regardless of transfering IFAToken's onwership to createIFA, because we already added CreateIFA to IFA's minters group
        // await this.ifa.transferOwnership(this.createIFA.address, {from: alice});
        // await this.iETH.methods.transferOwnership(this.bank.address, { from: alice });

        // await this.iETH.methods.approve(this.bank.address,toWei('200000')).send( { from: alice });
        await this.iETH.methods._setBanker(this.bank.address).send({ from: alice });
    });

    afterEach('Data cleaning', async () => {
        //  bob, carol Return of funds to alice
        let accounts = [bob, carol];
        let tokens = [this.wETH, this.ifa, this.iETH];
        for (let i = 0; i < accounts.length; i++) {
            let account = accounts[i]
            for (let t = 0; t < tokens.length; t++) {
                let token = tokens[t];
                let balanceOf = await token.methods.balanceOf(account).call();
                if (balanceOf * 1 > 0) {
                    await token.methods.transfer(alice, balanceOf).send({ from: account });
                }
            }
        }
    });

    context('Business scene', async () => {
        // public function
        const getUserAllBalanceOf = async (_user) => {
            return {
                'account': _user,
                'wETH': await this.wETH.methods.balanceOf(_user).call(),
                'iETH': await this.iETH.methods.balanceOf(_user).call(),
                'ifa': await this.ifa.methods.balanceOf(_user).call()
            }
        }

        context('seed wETH harvest IFA', async () => {
            it('seed wETH', async () => {
                let seedwETHAmount = toWei('100');
                await this.wETH.methods.transfer(bob, seedwETHAmount).send({ from: alice });
                let wETHBalanceOf = {
                    'init': await this.wETH.methods.balanceOf(bob).call()
                }
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob })
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                wETHBalanceOf['current'] = await this.wETH.methods.balanceOf(bob).call();
                assert.equal(wETHBalanceOf.init - wETHBalanceOf.current, seedwETHAmount, 'seed wETH fial');
            });

            it('First harvest IFA', async () => {
                let seedwETHAmount = toWei('100');
                await this.wETH.methods.transfer(bob, seedwETHAmount).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob })
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                let ifaBalanceOf = {}
                ifaBalanceOf['init'] = await this.ifa.methods.balanceOf(bob).call();
                await time.advanceBlock();
                await this.pool.claim(POOL_ID, { from: bob });
                // 2 block reward
                let valuePerShare = getValuePerShare(2, seedwETHAmount);
                let reward = updateReward(seedwETHAmount, valuePerShare);
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call();
                assert.equal(ifaBalanceOf.current - ifaBalanceOf.init, reward, `harvest amount error:${JSON.stringify(ifaBalanceOf)}`);
            });

            it('Second seed and harvest IFA', async () => {
                let funds = toWei('200');
                let seedwETHAmount = toWei('100');
                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob })
                let ifaBalanceOf = {
                    'init': await this.ifa.methods.balanceOf(bob).call()
                }
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await this.pool.claim(POOL_ID, { from: bob });
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call()
                let valuePerShare = getValuePerShare(2, seedwETHAmount);
                let oneReward = ifaBalanceOf.current - ifaBalanceOf.init;

                // second seed
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                for (i = 0; i < 10; i++) {
                    // block + 10
                    await time.advanceBlock();
                }
                await this.pool.claim(POOL_ID, { from: bob });
                //  11 block reward
                valuePerShare = getValuePerShare(12, seedwETHAmount);
                let reward = updateReward(seedwETHAmount, valuePerShare);
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call();
                assert.equal(ifaBalanceOf.current - ifaBalanceOf.init - oneReward, reward, `harvest amount error:${JSON.stringify(ifaBalanceOf)}`);
            });

            it('Multi-user seed and harvest IFA', async () => {
                let funds = toWei('100');
                let seedwETHAmount = toWei('100');
                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob })
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await this.pool.claim(POOL_ID, { from: bob });
                let wETHBalanceOf = await this.wETH.methods.balanceOf(bob).call();
                assert.equal(funds * 1 - seedwETHAmount * 1, wETHBalanceOf, 'Seed consumption amount is incorrect');

                // second user seed
                await this.wETH.methods.transfer(carol, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: carol })
                let ifaBalanceOf = {
                    'init': await this.ifa.methods.balanceOf(carol).call()
                }
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: carol });
                await this.pool.claim(POOL_ID, { from: carol });
                //  11 block reward
                let valuePerShare = getValuePerShare(1, seedwETHAmount * 2);
                let reward = updateReward(seedwETHAmount, valuePerShare);
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(carol).call();
                assert.equal(ifaBalanceOf.current - ifaBalanceOf.init, reward, `harvest amount error:${JSON.stringify(ifaBalanceOf)}`);
            });

            it('harvest IFA before withdraw', async () => {
                let funds = toWei('100');
                let seedwETHAmount = toWei('100');
                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob })
                let ifaBalanceOf = {
                    'init': await this.ifa.methods.balanceOf(bob).call()
                }
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await time.advanceBlock();  // block +1
                await this.pool.claim(POOL_ID, { from: bob });
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call();
                let valuePerShare = getValuePerShare(2, seedwETHAmount);
                let reward = updateReward(seedwETHAmount, valuePerShare);
                let claimReward = ifaBalanceOf.current - ifaBalanceOf.init;
                assert.equal(reward, claimReward, `claim reward amount error:${JSON.stringify(ifaBalanceOf)}`);

                await time.advanceBlock();  // block +1
                await this.pool.withdraw(POOL_ID, seedwETHAmount, { from: bob });
                valuePerShare = getValuePerShare(2, seedwETHAmount);
                reward = updateReward(seedwETHAmount, valuePerShare);
                let wETHBalanceOf = await this.wETH.methods.balanceOf(bob).call();
                ifaBalanceOf.current = await this.ifa.methods.balanceOf(bob).call();
                assert.equal(funds, wETHBalanceOf, 'withdraw full number error');
                assert.equal(reward, ifaBalanceOf.current - ifaBalanceOf.init - claimReward, `withdraw reward amount error:${JSON.stringify(ifaBalanceOf)}`)
            });

            it('harvest IFA before withdraw small number', async () => {
                let funds = toWei('100');
                let seedwETHAmount = toWei('100');
                let withdrawAmount = toWei('50');
                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob })
                let ifaBalanceOf = {
                    'init': await this.ifa.methods.balanceOf(bob).call()
                }
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await time.advanceBlock();  // block +1
                await this.pool.claim(POOL_ID, { from: bob });
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call();
                let valuePerShare = getValuePerShare(2, seedwETHAmount);
                let reward = updateReward(seedwETHAmount, valuePerShare);
                let claimReward = ifaBalanceOf.current - ifaBalanceOf.init;
                assert.equal(reward, claimReward, `claim reward amount error:${JSON.stringify(ifaBalanceOf)}`);

                await time.advanceBlock();  // block +1
                await this.pool.withdraw(POOL_ID, withdrawAmount, { from: bob });
                valuePerShare = getValuePerShare(2, seedwETHAmount);
                reward = updateReward(seedwETHAmount, valuePerShare);
                let wETHBalanceOf = await this.wETH.methods.balanceOf(bob).call();
                ifaBalanceOf.current = await this.ifa.methods.balanceOf(bob).call();
                assert.equal(withdrawAmount, wETHBalanceOf, 'withdraw small number error');
                assert.equal(reward, ifaBalanceOf.current - ifaBalanceOf.init - claimReward, `withdraw reward amount error:${JSON.stringify(ifaBalanceOf)}`)
            });

        });

        context('seed wETH borrow iETH', async () => {
            it('borrow iETH', async () => {
                let funds = toWei('200');
                let seedwETHAmount = toWei('100');
                let borrowAmount = toWei('70');    // borrow iETH
                let withdrawAmount = toWei('100');
                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob });
                // iETH as principal, Use ifa to repay interest
                await this.ifa.methods.transfer(bob, funds).send({ from: alice });
                await this.ifa.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                await this.iETH.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                let iETHBalanceOf = {
                    'init': await this.iETH.methods.balanceOf(bob).call()
                }
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await this.bank.borrow(POOL_ID, borrowAmount, { from: bob });
                iETHBalanceOf['current'] = await this.iETH.methods.balanceOf(bob).call();
                assert.equal(borrowAmount, iETHBalanceOf.current - iETHBalanceOf.init, 'borrow amount error');
            });

            it('borrow iETH pay BackIn Full', async () => {
                let funds = toWei('200');
                let seedwETHAmount = toWei('100');
                let borrowAmount = toWei('70');    // borrow iETH
                let withdrawAmount = toWei('100');
                let borrowTimestamp = 88400;    // 1 day equals 86400 seconds
                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob });
                // Use ifa to repay interest
                await this.ifa.methods.transfer(bob, funds).send({ from: alice });
                await this.ifa.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                await this.iETH.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                let iETHBalanceOf = {
                    'init': await this.iETH.methods.balanceOf(bob).call()
                }
                let ifaBalanceOf = {
                    'init': await this.ifa.methods.balanceOf(bob).call()
                }
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await time.advanceBlock();      // block +1
                await this.bank.borrow(POOL_ID, borrowAmount, { from: bob });
                await time.increase(borrowTimestamp);     // date + 1
                await time.advanceBlock();      // block +1
                let loanId = 0;
                let getLoanInfo = {
                    'lockedAmount': await this.calculator.getLoanLockedAmount(loanId),
                    'principal': await this.calculator.getLoanPrincipal(loanId),
                    'interest': await this.calculator.getLoanInterest(loanId)
                }
                await this.bank.payBackInFull(0, { from: bob });
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call();
                iETHBalanceOf['current'] = await this.iETH.methods.balanceOf(bob).call();
                // interest calc (One day is not enough)
                let durationByDays = Math.floor(borrowTimestamp / 86400) + 1;
                let interest = Math.floor(
                    new BN(borrowAmount)
                        .mul(new BN(this.rate.toString()))
                        .div(new BN(this.RATE_BASE.toString()))
                        .mul(new BN(durationByDays.toString())));
                // payIFAAmount iETH/ifa (1:200)
                let getIFAToiTokenRate = await this.bank.getIFAToiTokenRate(this.iETH.address);
                let payIFAAmount = new BN(`${interest}`).mul(new BN(`${getIFAToiTokenRate}`).div(new BN('100')));
                assert.equal(interest, getLoanInfo.interest, 'interest amount error');
                assert.equal(new BN(ifaBalanceOf.init).sub(payIFAAmount), ifaBalanceOf.current, 'ifa repayment of interest amount is incorrect');
                assert.equal(0, iETHBalanceOf.current, 'iETH repayment of interest amount is incorrect');
            });

            it('borrow iETH collectDebt', async () => {
                let funds = toWei('200');
                let seedwETHAmount = toWei('100');
                let borrowAmount = toWei('70');    // borrow iETH
                // collectDebt durationByDays = (90-70)/ (70 * 500 / 1000000)  (maximumAmount-principal)/(principal*rate/rate_base)
                let maximumAmount = new BN(`${seedwETHAmount * this.maximumLTV / 100}`);
                let borrowAmountBN = new BN(borrowAmount);
                let rate = new BN(this.rate);
                let rateBase = new BN(this.RATE_BASE);
                let durationByDays = Math.floor(maximumAmount.sub(borrowAmountBN).div(borrowAmountBN.mul(rate).div(rateBase)));
                let durationByTimestamp = durationByDays * 86400;    // 1 day equals 86400 seconds, 857 day

                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob });
                // Use ifa to repay interest
                await this.ifa.methods.transfer(bob, toWei('5000')).send({ from: alice });
                await this.ifa.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                await this.iETH.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                let wETHBalanceOf = {
                    'init': await this.wETH.methods.balanceOf(bob).call()
                }
                let iETHBalanceOf = {
                    'init': await this.iETH.methods.balanceOf(bob).call()
                }
                let ifaBalanceOf = {
                    'init': await this.ifa.methods.balanceOf(bob).call()
                }
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await this.bank.borrow(POOL_ID, borrowAmount, { from: bob });
                await time.increase(durationByTimestamp);     // date + 1
                await time.advanceBlock();      // block +1
                let loanId = 0;
                let getLoanInfo = {
                    'lockedAmount': (await this.calculator.getLoanLockedAmount(loanId)).toString(),
                    'principal': (await this.calculator.getLoanPrincipal(loanId)).toString(),
                    'interest': (await this.calculator.getLoanInterest(loanId)).toString()
                }
                wETHBalanceOf['current'] = await this.wETH.methods.balanceOf(bob).call();
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call();
                iETHBalanceOf['current'] = await this.iETH.methods.balanceOf(bob).call();

                // Ifa 200 is required to close the position
                // payIFAAmount = (interest + extra) * getIFAToiTokenRate / 100;
                // extra = (lockAmount - maximumAmount) / 2 [(100-90)/2] = 5
                // payIFAAmount = (20+5)*20000/100 = 5000
                // interest = principal * rate / rate_base * durationByDays [ 70*500/1000000 * 1 ]
                // collectDebt condition, principal + 70 * 500 / 1000000 * data >= 90 
                // collectDebt durationByDays = (90-70)/ (70 * 500 / 1000000)  (maximumAmount-principal)/(principal*rate/rate_base)
                let getIFAToiTokenRate = await this.bank.getIFAToiTokenRate(this.iETH.address);
                let extra = Math.floor(new BN(getLoanInfo.lockedAmount).sub(maximumAmount).div(new BN('2')));
                let payIFAAmount = Math.floor(
                    new BN(`${getLoanInfo.interest}`)
                        .add(new BN(`${extra}`))
                        .mul(new BN(`${getIFAToiTokenRate}`))
                        .div(new BN('100'))
                );
                await this.bank.collectDebt(POOL_ID, loanId, { from: bob });
                ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(bob).call();
                iETHBalanceOf['current'] = await this.iETH.methods.balanceOf(bob).call();
                wETHBalanceOf['current'] = await this.wETH.methods.balanceOf(bob).call();
                assert.equal(wETHBalanceOf.init - seedwETHAmount, wETHBalanceOf.current, 'Wrong amount of repayment wETH');
                assert.equal(ifaBalanceOf.init - payIFAAmount, ifaBalanceOf.current, 'Wrong amount of repayment ifa')
                assert.equal(0, iETHBalanceOf.current, 'Wrong amount of repayment iETH');
            });

            it('Forced liquidation before time', async () => {
                let funds = toWei('200');
                let seedwETHAmount = toWei('100');
                let borrowAmount = toWei('70');    // borrow iETH
                // collectDebt durationByDays = (90-70)/ (70 * 500 / 1000000)  (maximumAmount-principal)/(principal*rate/rate_base)
                let maximumAmount = new BN(`${seedwETHAmount * this.maximumLTV / 100}`);
                let borrowAmountBN = new BN(borrowAmount);
                let rate = new BN(this.rate);
                let rateBase = new BN(this.RATE_BASE);
                let durationByDays = Math.floor(maximumAmount.sub(borrowAmountBN).div(borrowAmountBN.mul(rate).div(rateBase)));
                let durationByTimestamp = durationByDays * 86400 - 864000;    // 1 day equals 86400 seconds, 857 day - 10 day

                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob });
                // Use ifa to repay interest
                await this.ifa.methods.transfer(bob, toWei('5000')).send({ from: alice });
                await this.ifa.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                await this.iETH.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                let wETHBalanceOf = {
                    'init': await this.wETH.methods.balanceOf(bob).call()
                }
                let iETHBalanceOf = {
                    'init': await this.iETH.methods.balanceOf(bob).call()
                }
                let ifaBalanceOf = {
                    'init': await this.ifa.methods.balanceOf(bob).call()
                }
                let loanId = 0;
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await this.bank.borrow(POOL_ID, borrowAmount, { from: bob });
                await time.increase(durationByTimestamp);     // date + 1
                await time.advanceBlock();      // block +1
                await expectRevert(
                    // Time is not up collectDebt failed
                    this.bank.collectDebt(POOL_ID, loanId, { from: bob }),
                    'collectDebt: >=',
                );

            });

            it('Liquidator performs liquidation', async () => {
                let funds = toWei('200');
                let seedwETHAmount = toWei('100');
                let borrowAmount = toWei('70');    // borrow iETH
                // collectDebt durationByDays = (90-70)/ (70 * 500 / 1000000)  (maximumAmount-principal)/(principal*rate/rate_base)
                let maximumAmount = new BN(`${seedwETHAmount * this.maximumLTV / 100}`);
                let borrowAmountBN = new BN(borrowAmount);
                let rate = new BN(this.rate);
                let rateBase = new BN(this.RATE_BASE);
                let durationByDays = Math.floor(maximumAmount.sub(borrowAmountBN).div(borrowAmountBN.mul(rate).div(rateBase)));
                let durationByTimestamp = durationByDays * 86400;    // 1 day equals 86400 seconds, 857 day

                await this.wETH.methods.transfer(bob, funds).send({ from: alice });
                await this.wETH.methods.transfer(carol, funds).send({ from: alice });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: bob });
                await this.wETH.methods.approve(this.pool.address, this.approveMaxAmount).send({ from: carol });
                // Use ifa to repay interest
                await this.ifa.methods.transfer(bob, toWei('5000')).send({ from: alice });
                await this.ifa.methods.transfer(carol, toWei('5000')).send({ from: alice });
                await this.ifa.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                await this.ifa.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: carol });
                await this.iETH.methods.transfer(carol, funds).send({ from: alice });
                await this.iETH.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: bob });
                await this.iETH.methods.approve(this.bank.address, this.approveMaxAmount).send({ from: carol });

                let bobBalanceOf = {
                    'init': await getUserAllBalanceOf(bob)
                }
                let carolBalanceOf = {
                    'init': await getUserAllBalanceOf(carol)
                }
                // console.log('bob:'+JSON.stringify(bobBalanceOf));
                // console.log('carol:'+JSON.stringify(carolBalanceOf));

                let loanId = 0;
                await this.pool.deposit(POOL_ID, seedwETHAmount, { from: bob });
                await this.bank.borrow(POOL_ID, borrowAmount, { from: bob });
                await time.increase(durationByTimestamp);     // date + 1
                await time.advanceBlock();      // block +1
                await this.bank.collectDebt(POOL_ID, loanId, { from: carol });
                bobBalanceOf['current'] = await getUserAllBalanceOf(bob);
                carolBalanceOf['current'] = await getUserAllBalanceOf(carol);

                console.log('bob:' + JSON.stringify(bobBalanceOf));
                console.log('carol:' + JSON.stringify(carolBalanceOf));

            });

        });
    });

    it('should work', async () => {
        return;
        // alice give bob and carol 1000 wETH for test purpose.
        let wETHBobInitBlanaceOf = toWei('3000');
        let wETHCarolInitBlanaceOf = toWei('3000');
        let wETHTotalSupply = await this.wETH.methods.totalSupply().call();
        let ifaInitBalanceOf = await this.ifa.methods.balanceOf(bob).call();

        console.log('total:' + wETHTotalSupply.toString());
        await this.wETH.methods.transfer(bob, wETHBobInitBlanaceOf).send({ from: alice });
        await this.wETH.methods.transfer(carol, wETHCarolInitBlanaceOf).send({ from: alice });

        // bob stakes 100.
        let amount = toWei('2000')
        await this.wETH.methods.approve(this.pool.address, amount).send({ from: bob });
        await this.pool.deposit(POOL_ID, amount, { from: bob });
        // 2 block later, he should get some IFA.
        await time.advanceBlock(); // Block 0
        await this.pool.claim(POOL_ID, { from: bob });  // Block 1
        let ifaCurrentBanaceOf = await this.ifa.methods.balanceOf(bob).call();
        let ifaBalanceOf = ifaCurrentBanaceOf - ifaInitBalanceOf;

        // 50% is for farmers, 50% goes to the Costco.
        let valuePerShare = getValuePerShare(2, amount);
        let reward = updateReward(amount, valuePerShare);

        assert.equal(ifaBalanceOf.valueOf(), reward);

        // borrow before
        var balanceOfiETH = await this.iETH.methods.balanceOf(bob).call();

        // lock at least 1 WETH
        await expectRevert(
            this.bank.borrow(2, 0, { from: bob }),  // Block 2
            'lock at least 1 WETH',
        );

        // Now borrow some iETH. The user can borrow at most 700
        // borrow 700 lock 1000
        await expectRevert(
            this.bank.borrow(2, toWei('2001'), { from: bob }),  // Block 2
            'Vault: lock too much',
        );
        // borrow before ieth balanceOf
        let notBorrowBalanceOf = await this.iETH.methods.balanceOf(bob).call();

        // Bob borrowed 1000 iETH (LoanID = 0)
        await this.bank.borrow(2, toWei('500'), { from: bob });  // Block 3
        await expectRevert(
            // Bob borrow 2000 iETH failed
            this.bank.borrow(2, toWei('1500'), { from: bob }),  // Block 4
            'Vault: lock too much',
        );
        let oneLockedAmount = Math.floor(toWei('500') / this.minimumLTV * 100);
        let vaultBalanceOf = await this.chateauLafitte.balanceOf(bob);

        balanceOfiETH = await this.iETH.methods.balanceOf(bob).call();

        // Bob borrowed 1000 iETH (LoanID = 1)
        await this.bank.borrow(2, toWei('200'), { from: bob });  // Block 5

        let twoLockedAmount = Math.floor(toWei('200') / this.minimumLTV * 100)
        let lockedAmount = await this.chateauLafitte.lockedAmount(bob);
        let totalLockedAmount = oneLockedAmount + twoLockedAmount;
        assert.equal(lockedAmount, totalLockedAmount);

        // Now he should have 700 ieth and locked 1000 wETH (Bob total staked:1000 wETH)
        balanceOfiETH = await this.iETH.methods.balanceOf(bob).call();
        balanceOfiETH = new BN(balanceOfiETH).sub(new BN(notBorrowBalanceOf));
        assert.equal(balanceOfiETH.toString(), toWei('700'));

        await this.pool.claim(2, { from: bob });  // Block 6

        // He is still mining ifa.
        ifaCurrentBanaceOf = await this.ifa.methods.balanceOf(bob).call();

        // 50% is for farmers, 50% goes to the costco.

        // Now, bob has 50 IFA tokens.
        valuePerShare = valuePerShare + getValuePerShare(6, amount);
        reward = updateReward(amount, valuePerShare);
        // assert.equal(ifaCurrentBanaceOf.toString(), reward+ifaBalanceOf);

        // Most of his wETH is locked now.
        await expectRevert(
            this.pool.withdraw(2, toWei('1001'), { from: bob }),  // Block 7
            'Vault: burn too much'
        );

        // Withdrawing 1000 is ok.
        await this.pool.withdraw(2, toWei('1000'), { from: bob });  // Block 8

        // deposit 1100000 wETH => 
        // locked 1000000 wETH to borrow 70000 iETH =>
        // withdraw 100000 wETH

        // Now he has 9000 wETH. 
        var balanceOfWETH = await this.wETH.methods.balanceOf(bob).call();
        // assert.equal(balanceOfWETH.toString(), toWei('9000'));

        // Now he can return loan of index 0.
        // He paid for Loan(LoanId = 0):
        // Total borrowed iETH(LoanId = 0 and LoanId = 1):1000000 iETH
        await this.iETH.methods.approve(this.bank.address, toWei('100000')).send({ from: bob });  // Block 9
        // part of interest should be paied by IFA. please make sure there is sufficient IFA's balance in bob's wallet
        // 1. principal:600000 iETH
        // 2. interest: 600000 * 0.0005 iETH equivalent of IFA
        // assume 300 iETH = 2 IFA
        await this.ifa.methods.approve(this.bank.address, toWei('100000')).send({ from: bob });

        // let IFAToiTokenRate = await this.bank.getReserveRatio(this.wETH.address, this.iETH.address, { from: alice });
        // console.log('getIFAToiTokenRate:' + IFAToiTokenRate[0].toString() + ',' + IFAToiTokenRate[1].toString());

        await this.bank.payBackInFull(0, { from: bob });
        balanceOfiETH = await this.iETH.methods.balanceOf(bob).call();
        assert.equal(balanceOfiETH.valueOf(), 700000);
        // 35 - 2 = 33 IFA
        // Just write an assumption here, please mock and check this case.
        assert.equal(balanceOfIFA.valueOf(), 33);

        // Bob can withdraw now.
        this.pool.withdraw(2, 500000, { from: bob });  // Block 10

        // Bob transfer 100000 iETH to alice or swap iETH for USDT in uniswap or iETH rebased
        await this.ieth.transfer(alice, 100000, { from: bob });

        // Not enough iETH left, he can't pay off index 1 now.
        await expectRevert(
            this.bank.payBackInFull(1, { from: bob }),  // Block 11
            'burn amount exceeds balance'
        );

        // 2 years later. Someone else, carol can collect the debt.
        await time.increase(time.duration.years(2));

        // Bob has some vault asset locked.
        var balanceOfBobVault = await this.chateauLafitte.balanceOf(bob);
        assert.equal(balanceOfBobVault.valueOf(), 500000);
        var lockedBalanceOfBobVault = await this.chateauLafitte.lockedAmount(bob);
        // 100000 * 100 / 70 = 142857 wETH is locked.
        assert.equal(lockedBalanceOfBobVault.valueOf(), 142857);

        // Carol stakes 2000000 wETH, and quickly borrows 1400000 iETH
        await this.wETH.approve(this.pool.address, 2000000, { from: carol });
        await this.pool.deposit(2, 2000000, { from: carol });
        await this.bank.borrow(2, 1400000, { from: carol });
        balanceOfiETH = await this.ieth.balanceOf(carol);
        assert.equal(balanceOfiETH.valueOf(), 1400000);

        // Now carol can collect bob's debt, which is loanId = 1.
        await this.ieth.approve(this.bank.address, 1400000, { from: carol });
        // assume carol bought 2000 IFA from uniswap
        // and assume [28571 + (142857 - 128571) / 2] iETH = 35714 iETH = 1500 IFA
        await this.ifa.approve(this.bank.address, 1500, { from: carol });
        // Bob's debt details:
        // the debt principal is 100000 iETH
        // The locked wETH amount is 100000 / 70 * 100 = 142857 wETH
        // The accumulated debt of loanId #1 is 100000 / 70 * 90 = 128571 iETH
        // the debt interest is 128571 - 100000 = 28571 iETH
        // Coral nees to pay 100000 with iETH and pay [28571 + (142857 - 128571) / 2] iETH equivalent of IFA
        await this.bank.collectDebt(2, 1, { from: carol });

        balanceOfiETH = await this.ieth.balanceOf(carol);
        assert.equal(balanceOfiETH.valueOf(), 1300000);

        // Bob should lose his locked asset. 500000 - 142857 = 357143
        balanceOfBobVault = await this.chateauLafitte.balanceOf(bob);
        assert.equal(balanceOfBobVault.valueOf(), 357143);
        lockedBalanceOfBobVault = await this.chateauLafitte.lockedAmount(bob);
        assert.equal(lockedBalanceOfBobVault.valueOf(), 0);

        // Now carol has more vault assets.
        var balanceOfCarolVault = await this.chateauLafitte.balanceOf(carol);
        assert.equal(balanceOfCarolVault.valueOf(), 2142857);
        var lockedBalanceOfCarolVault = await this.chateauLafitte.lockedAmount(carol);
        // Carol still has 2000000 locked.
        assert.equal(lockedBalanceOfCarolVault.valueOf(), 2000000);
    });
});

contract('testing deploy migrate', (accounts) => {
    before('init params', async () => {
        let poolJson = require('../build/contracts/IFAPool.json');
        let bankJson = require('../build/contracts/IFABank.json');
        let tokenJson = require('../build/contracts/MockERC20.json');
        let birrCastleJson = require('../build/contracts/BirrCastle.json');
        let ifaJson = require('../build/contracts/IFAToken.json');
        let iTokenJson = require('../build/contracts/iTokenDelegator.json');
        let wETHJson = require('../build/contracts/wETH.json');
        this.approveAmount = toWei('999990000');
        this.publicContract = {
            "IFAPool": "0x9E047A6BE5244629376aCD0C2c453E6eEC29Ac13",
            "IFAMaster": "0xf03a26206DB65f8DB8a52522d3368D08C5DECBf6",
            "IFABank": "0x448488074ACdba760E55856647Ffe35EE7a3b62f",
            "Costco": "0x622ceD240117E64a073642Ee8aFFF1B52d572Cd0",
            "sCRVCalculator": "0x5aF003c7Fc13513c7Bd0B82d4ddBdb25C59433aC",
            "btcCRVCalculator": "0xe99D2a80426A9A3CB58e4B8158Bd7391500634F1",
            "wETHCalculator": "0xA2a54d0d355DbBCDed5C27485afb11D12DdE6103",
            "IFARevenue": "0x36dFf674E4c9d1a9Cb2cD5325A596DF345f2caEF",
            "CreateIFA": "0xA9abfdABE33468cA996D59F2C04BFda0dA7c020f",
            "ShareRevenue": "0x6ee20aaFBE0fbC14852A9175B713697516D3EDea"
        }
        this.allTokens = {
            "iETH": "0xc257BCf9EEEbC727C14BA4451298ec70534540eC",
            "iBTC": "0x3362599C498AaE2087ace38CEff19FcE08FfD0ae",
            "iUSD": "0xB178B47afbc33BDd036D178E4F48d3086e3beFF5",
            "wETH": "0x9004529746a3d2496E46248929a3a57Cd30B0d0f",
            "iUSD_sCRV": "0x13365AACAf53B13783B5dc0ff7a6F5DA60129347",
            "iBTC_btcCRV": "0x80C97D1A9f8281727A63e5e8588095D35aAfaB4a",
            "iETH_ETH": "0x1c248d96d50d4A07F7dD13305D75d6679aDCA1a3",
            "IFA_sCRV": "0xCd8752A5f6c62635573adAD6a2bd071FB95C02d9",
            "IFA_btcCRV": "0x9566058Dc700Ec7BF46a33a9D4dF7F81d9c1e1D7",
            "IFA_ETH": "0x1f1930E533623f304e69147185Fff5f329CdCa32",
            "sCRV": "0x3756838Da5ca3D01105466bB2589baCC5C302553",
            "btcCRV": "0x2F4a6Ceea43AA5193AF72Ea8B498409BE22F8566",
            "IFA": "0x567E6A969170217862632cFE93b6e36B9565e262"
        }
        this.allVaults = {
            "BirrCastle": "0xC694c94bE7420fA5434f1Bd9f17195EF93d8E8cd",
            "Sunnylands": "0x65C356C61Cb8C414ACCCD7860f28351832aF06a5",
            "ChateauLafitte": "0x6Cceb09767219956120FB0cFB9821Bf610446B20",
            "AdareManor": "0x303B7ca4748926b978A0c9300A81f25ee4341aCe",
            "VillaDEste": "0x2fB27FEa5af22aD387b852E3b3400E4d1F0b291e",
            "VillaLant": "0xcA0a8Bf1c7a12A3B0D2e469CA9D0e95813E6d5A1",
            "VillaFarnese": "0x2c7010C7E17F04ADacCCc00A9eDFe4B780E0fCfA",
            "ChatsworthHouse": "0xd9F8c920746a820185a9Df8c33B8ff871165FdBB",
            "ChateauMargaux": "0xAD351F6780B616aD536e47e5FCBb472e2A733759"
        }
        this.pool = new web3.eth.Contract(poolJson.abi, this.publicContract.IFAPool);
        this.bank = new web3.eth.Contract(bankJson.abi, this.publicContract.IFABank);
        this.sCRV = new web3.eth.Contract(tokenJson.abi, this.allTokens.sCRV);
        this.birrCastle = new web3.eth.Contract(birrCastleJson.abi, this.allVaults.BirrCastle);
        this.ifa = new web3.eth.Contract(ifaJson.abi, this.allTokens.IFA);
        this.iUSD = new web3.eth.Contract(iTokenJson.abi, this.allTokens.iUSD);
        this.wETH = new web3.eth.Contract(wETHJson.abi, this.allTokens.wETH);
        this.btcCRV = new web3.eth.Contract(tokenJson.abi, this.allTokens.btcCRV);
        this.iUSD_sCRV = new web3.eth.Contract(tokenJson.abi, this.allTokens.iUSD_sCRV);
    });
    context('Birr Castle Pool', async () => {
        it('seed sCRV', async () => {
            let poolId = 2;
            let seedAmount = toWei('100');
            let ifaBalanceOf = {
                'init': await this.ifa.methods.balanceOf(accounts[0]).call()
            }
            let wETHBalanceOf = {
                'init': await this.sCRV.methods.balanceOf(accounts[0]).call()
            }
            await this.sCRV.methods.approve(this.pool.options.address, this.approveAmount).send({ from: accounts[0] });
            await this.btcCRV.methods.approve(this.pool.options.address, this.approveAmount).send({ from: accounts[0] });
            await this.wETH.methods.approve(this.pool.options.address, this.approveAmount).send({ from: accounts[0] });
            await this.ifa.methods.approve(this.pool.options.address, this.approveAmount).send({ from: accounts[0] });
            // await this.iUSD.methods.approve(this.pool.options.address, this.approveAmount).send({ from: accounts[0] });
            await this.pool.methods.deposit(poolId, seedAmount).send({ from: accounts[0], gas: '1000000' });

            time.advanceBlock();
            await this.pool.methods.claim(poolId).send({ from: accounts[0], gas: '1000000' });
            wETHBalanceOf['current'] = await this.sCRV.methods.balanceOf(accounts[0]).call();
            ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(accounts[0]).call();
            let reward = await this.birrCastle.methods.getPendingReward(accounts[0], 0).call({ from: accounts[0] });
            console.log(reward);
            console.log(wETHBalanceOf);
            console.log(ifaBalanceOf);
        });

        it.only('seed lp token 3 - 8', async () => {
            let poolId = 3;
            let seedAmount = toWei('100');
            let ifaBalanceOf = {
                'init': await this.ifa.methods.balanceOf(accounts[0]).call()
            }
            let iUSD_sCRVBalanceOf = {
                'init': await this.iUSD_sCRV.methods.balanceOf(accounts[0]).call()
            }
            await this.iUSD_sCRV.methods.approve(this.pool.options.address, this.approveAmount).send({ from: accounts[0] });
            await this.ifa.methods.approve(this.pool.options.address, this.approveAmount).send({ from: accounts[0] });
            await this.pool.methods.deposit(poolId, seedAmount).send({ from: accounts[0], gas: '1000000' });

            time.advanceBlock();
            await this.pool.methods.claim(poolId).send({ from: accounts[0], gas: '1000000' });
            iUSD_sCRVBalanceOf['current'] = await this.iUSD_sCRV.methods.balanceOf(accounts[0]).call();
            ifaBalanceOf['current'] = await this.ifa.methods.balanceOf(accounts[0]).call();
            let reward = await this.birrCastle.methods.getPendingReward(accounts[0], 0).call({ from: accounts[0] });
            console.log(reward);
            console.log(iUSD_sCRVBalanceOf);
            console.log(ifaBalanceOf);
        });

    });
});
