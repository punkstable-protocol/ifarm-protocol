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
const wETHCalculator = artifacts.require('wETHCalculator');
const ChateauLafitte = artifacts.require('ChateauLafitte');
const fs = require('fs');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

// new iToken contract object from imported json file
let jsonFile = "/Users/Snail/Projects/DeFi/itoken-protocol/build/contracts/iTokenDelegator.json";
let parsed = JSON.parse(fs.readFileSync(jsonFile));
let iETHContractAddress = "0x1234567891®2345678912345678912345678912";

contract('IFABank', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.ifaMaster = await IFAMaster.new({from: alice});

        this.wETH = await MockERC20.new('Fake Wrapped Ethereum', 'wETH', 3100000, {from: alice});
        await this.ifaMaster.setWETH(this.wETH.address);

        this.ifa = await IFAToken.new({from: alice});
        await this.ifaMaster.setIFA(this.ifa.address, {from: alice});

        const K_MADE_iETH = 2;

        this.iETH = new web3.eth.Contract(parsed.abi, iETHContractAddress);
        this.iETH.address = iETHContractAddress;
        await this.ifaMaster.addIFAMade(K_MADE_iETH, this.iETH.address, {from: alice});

        this.pool = await IFAPool.new({from: alice});
        await this.ifaMaster.setPool(this.pool.address, {from: alice});

        this.bank = await IFABank.new(this.ifaMaster.address, {from: alice});
        await this.ifaMaster.setBank(this.bank.address, {from: alice});

        this.revenue = await IFARevenue.new(this.ifaMaster.address, {from: alice});
        await this.ifaMaster.setRevenue(this.revenue.address, {from: alice});

        this.costco = await Costco.new(this.ifaMaster.address, {from: alice});
        await this.ifaMaster.setCostco(this.costco.address, {from: alice});

        this.createIFA = await CreateIFA.new(this.ifaMaster.address, {from: alice});
        await this.ifa.addMinter(this.createIFA.address);

        const K_STRATEGY_CREATE_IFA = 0;
        await this.ifaMaster.addStrategy(K_STRATEGY_CREATE_IFA, this.createIFA.address, {from: alice});

        this.chateauLafitte = await ChateauLafitte.new(this.ifaMaster.address, this.createIFA.address, {from: alice});
        const K_VAULT_CHATEAU_LAFITTE = 2;
        await this.ifaMaster.addVault(K_VAULT_CHATEAU_LAFITTE, this.chateauLafitte.address, {from: alice});

        this.calculator = await wETHCalculator.new(this.ifaMaster.address, {from: alice});
        await this.calculator.changeRateAndLTV(550, 70, 90, {from: alice});
        const K_CALCULATOR_wETH = 2;
        await this.ifaMaster.addCalculator(K_CALCULATOR_wETH, this.calculator.address, {from: alice});

        const now = Math.floor((new Date()).getTime() / 1000);
        // Let the pool start now.
        await this.pool.setPoolInfo(2, this.wETH.address, this.chateauLafitte.address, now, {from: alice});
        await this.createIFA.setPoolInfo(2, this.chateauLafitte.address, this.wETH.address, 1, false, {from: alice});
        await this.bank.setPoolInfo(2, this.ieth.address, this.chateauLafitte.address, this.calculator.address, {from: alice});

        // It will works well regardless of transfering IFAToken's onwership to createIFA, because we already added CreateIFA to IFA's minters group
        // await this.ifa.transferOwnership(this.createIFA.address, {from: alice});
        await this.ieth.transferOwnership(this.bank.address, {from: alice});
    });

    it('should work', async () => {
        // alice give bob 1100000 for test purpose.
        await this.wETH.transfer(bob, 1100000, {from: alice});
        await this.wETH.transfer(carol, 2000000, {from: alice});
        // bob stakes 1100000.
        await this.wETH.approve(this.pool.address, 1100000, {from: bob});
        await this.pool.deposit(2, 1100000, {from: bob});
        // 2 block later, he should get some IFA.
        await time.advanceBlock(); // Block 0
        await this.pool.claim(2, {from: bob});  // Block 1
        var balanceOfIFA = await this.ifa.balanceOf(bob);
        // 50% is for farmers, 50% goes to the Costco.
        assert.equal(balanceOfIFA.valueOf(), Math.floor(20 * 1e18 * 0.5));

        // Now borrow some iETH. The user can borrow at most 770000
        await expectRevert(
            this.bank.borrow(2, 800000, {from: bob}),  // Block 2
            'Vault: lock too much',
        );

        // Bob borrowed 600000 iETH (LoanID = 0)
        await this.bank.borrow(2, 600000, {from: bob}),  // Block 3
            await expectRevert(
                // Bob borrow 200000 iETH failed
                this.bank.borrow(2, 200000, {from: bob}),  // Block 4
                'Vault: lock too much',
            );
        // Bob borrowed 100000 iETH (LoanID = 1)
        await this.bank.borrow(2, 100000, {from: bob});  // Block 5

        // Now he should have 700000 ieth and locked 1000000 wETH (Bob total staked:1100000 wETH)
         var balanceOfiETH = await this.ieth.balanceOf(bob);
        assert.equal(balanceOfiETH.valueOf(), 700000);

        await this.pool.claim(2, {from: bob});  // Block 6

        // He is still mining ifa.
        balanceOfIFA = await this.ifa.balanceOf(bob);
        // 50% is for farmers, 50% goes to the costco.

        // Now, bob has 35 IFA tokens.
        assert.equal(balanceOfIFA.valueOf(), Math.floor(7 * 10 * 1e18 * 0.5));

        // Most of his wETH is locked now.
        await expectRevert(
            this.pool.withdraw(2, 500000, {from: bob}),  // Block 7
            'Vault: burn too much'
        );

        // Withdrawing 100000 is ok.
        await this.pool.withdraw(2, 100000, {from: bob});  // Block 8
    
        // deposit 1100000 wETH => 
        // locked 1000000 wETH to borrow 70000 iETH =>
        // withdraw 100000 wETH

        // Now he has 100000 wETH. 
        var balanceOfWETH = await this.wETH.balanceOf(bob);
        assert.equal(balanceOfWETH.valueOf(), 100000);

        // Now he can return loan of index 0.
        await this.ieth.approve(this.bank.address, 1000000, {from: bob});  // Block 9

        // part of interest should be paied by IFA. please make sure there is sufficient IFA's balance in bob's wallet
        await this.bank.payBackInFull(0, {from: bob});

        // He paid for Loan(LoanId = 0):
        // 1. principal:600000 iETH
        // 2. interest: 600000 * 0.0005 iETH equivalent of IFA
        balanceOfiETH = await this.ieth.balanceOf(bob);
        assert.equal(balanceOfiETH.valueOf(), 700000);
        // assume 300 iETH = 2 IFA
        // 35 - 2 = 33 IFA
        // Just write an assumption here, please mock and check this case.
        assert.equal(balanceOfIFA.valueOf(), 33);

        // Bob can withdraw now.
        this.pool.withdraw(2, 500000, {from: bob});  // Block 10

        // Not enough ieth left, he can't pay off index 1 now.
        await expectRevert(
            this.bank.payBackInFull(1, {from: bob}),  // Block 11
            'burn amount exceeds balance'
        );

        // 2 years later. Someone else, carol can collect the debt.
        //await this.bank.collectDebt(2, { from: bob });
        await time.increase(time.duration.years(2));

        // Bob has some vault asset locked.
        var balanceOfBobVault = await this.chateauLafitte.balanceOf(bob);
        assert.equal(balanceOfBobVault.valueOf(), 500000);
        var lockedBalanceOfBobVault = await this.chateauLafitte.lockedAmount(bob);
        // 100000 * 100 / 70 = 142857 is locked.
        assert.equal(lockedBalanceOfBobVault.valueOf(), 142857);

        // Carol stakes 2000000, and quickly borrows 1400000
        await this.wETH.approve(this.pool.address, 2000000, {from: carol});
        await this.pool.deposit(2, 2000000, {from: carol});
        await this.bank.borrow(2, 1400000, {from: carol});
        balanceOfiETH = await this.ieth.balanceOf(carol);
        assert.equal(balanceOfiETH.valueOf(), 1400000);

        // Now carol can collect bob's debt, which are loanId = 0 and 1.
        await this.ieth.approve(this.bank.address, 1400000, {from: carol});
        await this.ifa.approve(this.bank.address, 22222, {from: carol});
        // Bob's debt details:
        // the debt principal is 100000
        // The locked wETH amount is 100000 / 70 * 100 = 142857
        // The accumulated debt of loanId #1 is 100000 / 70 * 90 = 128571
        // the debt interest is 128571 - 100000 = 28571 
        // Coral nees to pay 100000 with ieth and pay [28571 + (142857 - 128571) / 2] ieth equivalent of IFA
        await this.bank.collectDebt(2, 1, {from: carol});
 
        balanceOfiETH = await this.ieth.balanceOf(carol);
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
