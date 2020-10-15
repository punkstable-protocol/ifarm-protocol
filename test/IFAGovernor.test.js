const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const CreateIFA = artifacts.require('CreateIFA');
const GovernorAlpha = artifacts.require('GovernorAlpha');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const IFAMaster = artifacts.require('IFAMaster');
const MockERC20 = artifacts.require('MockERC20');
const Timelock = artifacts.require('Timelock');
const WETHVault = artifacts.require('WETHVault');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

contract('Governor', ([alice, bob, tom]) => {

    beforeEach(async () => {
        this.ifaMaster = await IFAMaster.new({ from: alice });

        this.wETH = await MockERC20.new('Fake Wrapped Ethereum', 'WETH', '1000000', { from: alice });
        await this.ifaMaster.setWETH(this.wETH.address);

        this.ifa = await IFAToken.new({ from: alice });
        await this.ifaMaster.setIFA(this.ifa.address);

        this.pool = await IFAPool.new({ from: alice });
        await this.ifaMaster.setPool(this.pool.address);

        this.createIFA = await CreateIFA.new(this.ifaMaster.address, { from: alice });
        const K_STRATEGY_CREATE_IFA = 0;
        await this.ifaMaster.addStrategy(K_STRATEGY_CREATE_IFA, this.createIFA.address);

        this.wethVault = await WETHVault.new(this.ifaMaster.address, this.createIFA.address, { from: alice });
        const K_VAULT_WETH = 0;
        await this.ifaMaster.addVault(K_VAULT_WETH, this.wethVault.address);

        // Let bob have enough ifa, and bob should delegate tom.
        this.ifa.mint(bob, 1000, { from: alice });
        this.ifa.delegate(tom, { from: bob });
        

        this.timelock = await Timelock.new(alice, time.duration.days(1), { from: alice });

        await this.ifaMaster.transferOwnership(this.timelock.address, { from: alice });
        await this.ifa.transferOwnership(this.createIFA.address, { from: alice });
        await this.pool.transferOwnership(this.timelock.address, { from: alice });
        await this.createIFA.transferOwnership(this.timelock.address, { from: alice });
        await this.wethVault.transferOwnership(this.timelock.address, { from: alice });
    });

    it('should work', async () => {
        this.gov = await GovernorAlpha.new(this.timelock.address, this.ifa.address, alice, { from: alice });

        // Transfer time lock admin from alice to gov.
        await this.timelock.setPendingAdmin(this.gov.address, { from: alice });
        await this.gov.__acceptAdmin({ from: alice });
        await expectRevert(
            this.pool.setPoolInfo('0', this.wETH.address, this.wethVault.address, '1234', { from: alice }),
            'Ownable: caller is not the owner',
        );
        await expectRevert(
            this.gov.propose(
                [this.pool.address], ['0'], ['setPoolInfo(uint256, address, address, uint256)'],
                [encodeParameters(['uint256', 'address', 'address', 'uint256'], ['0', this.wETH.address, this.wethVault.address, '1234'])],
                'Add Pool',
                { from: alice },
            ),
            'GovernorAlpha::propose: proposer votes below proposal threshold',
        );
        await this.gov.propose(
            [this.pool.address], ['0'], ['setPoolInfo(uint256,address,address,uint256)'],
            [encodeParameters(['uint256', 'address', 'address', 'uint256'], ['0', this.wETH.address, this.wethVault.address, '1234'])],
            'Add a pool',
            { from: tom },
        );
        await time.advanceBlock();
        await this.gov.castVote('1', true, { from: tom });
        await expectRevert(this.gov.queue('1'), "GovernorAlpha::queue: proposal can only be queued if it is succeeded");
        console.log("Advancing 17280 blocks. Will take a while...");
        for (let i = 0; i < 17280; ++i) {
            await time.advanceBlock();
        }
        await this.gov.queue('1');
        await expectRevert(this.gov.execute('1'), "Timelock::executeTransaction: Transaction hasn't surpassed time lock.");
        await time.increase(time.duration.days(2));
        await this.gov.execute('1');
        assert.equal((await this.pool.poolMap('0')).valueOf().startTime, '1234');
    });
});
