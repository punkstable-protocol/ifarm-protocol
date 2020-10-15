const {expectRevert, time} = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const IFARevenue = artifacts.require('IFARevenue');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const MockERC20 = artifacts.require('MockERC20');
const Timelock = artifacts.require('Timelock');
const WETHCalculator = artifacts.require('WETHCalculator');
const ChateauLafitte = artifacts.require('ChateauLafitte');
const fs = require('fs');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

// new iToken contract object from imported json file
let jsonFile = "/Users/Jeremy/Projects/DeFi/ifarm-internal/ifarm-protocol/build/contracts/iTokenDelegator.json";
let parsed = JSON.parse(fs.readFileSync(jsonFile));
let iUSDContractAddress = "0x12345678912345678912345678912345678912";
let iBTCContractAddress = "0x12345678912345678912345678912345678912";
let iETHContractAddress = "0x12345678912345678912345678912345678912";

contract('IFABank', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.ifaMaster = await IFAMaster.new({from: alice});

        this.wETH = await MockERC20.new('Fake Wrapped Ethereum', 'WETH', 3100000, {from: alice});
        await this.ifaMaster.setWETH(this.wETH.address);

        this.ifa = await IFAToken.new({from: alice});
        await this.ifaMaster.setIFA(this.ifa.address, {from: alice});

        const K_MADE_IETH = 0;

        this.iETH = new web3.eth.Contract(parsed.abi, iETHContractAddress);
        this.iETH.address = iETHContractAddress;
        await this.ifaMaster.addIFAMade(K_MADE_IETH, this.iETH.address, {from: alice});

        this.pool = await IFAPool.new({from: alice});
        await this.ifaMaster.setPool(this.pool.address, {from: alice});

        this.bank = await IFABank.new(this.ifaMaster.address, {from: alice});
        await this.ifaMaster.setBank(this.bank.address, {from: alice});

        // origin Costco.new
        this.revenue = await IFARevenue.new(this.ifaMaster.address, {from: alice});
        await this.ifaMaster.setRevenue(this.revenue.address, {from: alice});

        this.costco = await Costco.new(this.ifaMaster.address, {from: alice});
        await this.ifaMaster.setCostco(this.costco.address, {from: alice});

        this.createIFA = await CreateIFA.new(this.ifaMaster.address, {from: alice});
        const K_STRATEGY_CREATE_IFA = 0;
        await this.ifaMaster.addStrategy(K_STRATEGY_CREATE_IFA, this.createIFA.address, {from: alice});

        this.chateauLafitte = await ChateauLafitte.new(this.ifaMaster.address, this.createIFA.address, {from: alice});
        const K_VAULT_CHATEAU_LAFITTE = 2;
        await this.ifaMaster.addVault(K_VAULT_CHATEAU_LAFITTE, this.chateauLafitte.address, {from: alice});

        this.calculator = await WETHCalculator.new(this.ifaMaster.address, {from: alice});
        await this.calculator.changeRateAndLTV(500, 70, 90, {from: alice});
        const K_CALCULATOR_wETH = 2;
        await this.ifaMaster.addCalculator(K_CALCULATOR_wETH, this.calculator.address, {from: alice});

        const now = Math.floor((new Date()).getTime() / 1000);
        // Let the pool start now.
        await this.pool.setPoolInfo(0, this.wETH.address, this.chateauLafitte.address, now, {from: alice});
        await this.createIFA.setPoolInfo(0, this.chateauLafitte.address, this.wETH.address, 1, false, {from: alice});
        await this.bank.setPoolInfo(0, this.ieth.address, this.chateauLafitte.address, this.calculator.address, {from: alice});

        await this.ifa.transferOwnership(this.createIFA.address, {from: alice});
        await this.ieth.transferOwnership(this.bank.address, {from: alice});
    });

    it('should work', async () => {
        // alice give bob 100 for test purpose.
        await this.wETH.transfer(bob, 1100000, {from: alice});
        await this.wETH.transfer(carol, 2000000, {from: alice});
        // bob stakes 110.
        await this.wETH.approve(this.pool.address, 1100000, {from: bob});
        await this.pool.deposit(0, 1100000, {from: bob});
        // 2 block later, he should get some IFA.
        await time.advanceBlock(); // Block 0
        await this.pool.claim(0, {from: bob});  // Block 1
        var balanceOfIFA = await this.ifa.balanceOf(bob);
        // 95% is for farmers, 5% goes to the dev pool.
        assert.equal(balanceOfIFA.valueOf(), Math.floor(2000 * 1e18 * 0.95));

        // Mow borrow some iETH. The user can borrow at most 770000
        await expectRevert(
            this.bank.borrow(0, 800000, {from: bob}),  // Block 2
            'Vault: lock too much',
        );
        await this.bank.borrow(0, 600000, {from: bob}),  // Block 3
            await expectRevert(
                this.bank.borrow(0, 200000, {from: bob}),  // Block 4
                'Vault: lock too much',
            );
        await this.bank.borrow(0, 100000, {from: bob});  // Block 5

        // Now he should have 700000 ieth
        var balanceOfiETH = await this.ieth.balanceOf(bob);
        assert.equal(balanceOfiETH.valueOf(), 7);

        await this.pool.claim(0, {from: bob});  // Block 6

        // He is still mining ifa.
        balanceOfIFA = await this.ifa.balanceOf(bob);
        // 50% is for farmers, 50% goes to the costco.
        assert.equal(balanceOfIFA.valueOf(), Math.floor(7 * 1e18 * 0.95));

        // Most of his WETH is locked now.
        await expectRevert(
            this.pool.withdraw(0, 500000, {from: bob}),  // Block 7
            'Vault: burn too much'
        );

        // Withdrawing 100000 is ok.
        await this.pool.withdraw(0, 100000, {from: bob});  // Block 8
        // Now he has 100000 WETH.
        var balanceOfWETH = await this.wETH.balanceOf(bob);
        assert.equal(balanceOfWETH.valueOf(), 100000);

        // Now he can return loan of index 0.
        await this.ieth.approve(this.bank.address, 1000000, {from: bob});  // Block 9
        await this.bank.payBackInFull(0, {from: bob});

        // He paid 600000 + 600000 * 0.0005 = 600300
        // has 99700 remaining.
        balanceOfiETH = await this.ieth.balanceOf(bob);
        assert.equal(balanceOfiETH.valueOf(), 99700);

        // Bob can withdraw now.
        this.pool.withdraw(0, 500000, {from: bob});  // Block 10

        // Not enough ieth left, he can't pay off index 1 now.
        await expectRevert(
            this.bank.payBackInFull(1, {from: bob}),  // Block 11
            'burn amount exceeds balance'
        );

        // 2 years later. Someone else, carol can collect the debt.
        //await this.bank.collectDebt(0, { from: bob });
        await time.increase(time.duration.years(2));

        // Bob has some vault asset locked.
        var balanceOfBobVault = await this.chateauLafitte.balanceOf(bob);
        assert.equal(balanceOfBobVault.valueOf(), 500000);
        var lockedBalanceOfBobVault = await this.chateauLafitte.lockedAmount(bob);
        // 100000 * 100 / 70 = 142857 is locked.
        assert.equal(lockedBalanceOfBobVault.valueOf(), 142857);

        // Carol stakes 2000000, and quickly borrows 1400000
        await this.wETH.approve(this.pool.address, 2000000, {from: carol});
        await this.pool.deposit(0, 2000000, {from: carol});
        await this.bank.borrow(0, 1400000, {from: carol});
        balanceOfiETH = await this.ieth.balanceOf(carol);
        assert.equal(balanceOfiETH.valueOf(), 1400000);

        // Now carol can collect bob's debt, which are loanId = 0 and 1.
        await this.ieth.approve(this.bank.address, 1400000, {from: carol});
        await this.bank.collectDebt(0, 1, {from: carol});
        // The accumulated debt of loanId #1 is 100000 / 70 * 90 = 128571
        // The loaded WETH account is 100000 / 70 * 100 = 142857
        // Coral needs to pay 128571 + (142857 - 128571) / 2 = 135714
        balanceOfiETH = await this.ieth.balanceOf(carol);
        // 1400000 - 135714 = 1264286
        assert.equal(balanceOfiETH.valueOf(), 1264286);

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
