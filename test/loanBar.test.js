const { balance, ether, constants, time } = require("@openzeppelin/test-helpers")
const IFAPool = artifacts.require("IFAPool")
const IFABank = artifacts.require("IFABank")
const IFAToken = artifacts.require("IFAToken")
const MockERC20 = artifacts.require("MockERC20")
const iTokenDelegator = require("./contractsJson/iTokenDelegator.json")

const IFAPoolAddress = "0xf780F7dd369d9Fe02376BdB4943112b2E928434f"
const IFABankAddress = "0xc35F5Ad6064F65F3b4892696A05bb11d41c2742E"
const SeedToken = "0xc43dC480db4267291553f10E4F232a3C3f6F3C6C"          //usdt
const RiceToken = "0x55897D09951f9D2933BEeb674DEfF232CffFd8e2";
const rUSDToken = "0xf88E0663C5E13ce74277d6881523E191B29bbaBA"

contract('loanBar contract test', ([alice, bob]) => {
    before(async () => {
        this.bank = await IFABank.at(IFABankAddress)
        this.pool = await IFAPool.at(IFAPoolAddress)
        this.usdt = new web3.eth.Contract(MockERC20.abi, SeedToken)
        this.rice = await IFAToken.at(RiceToken)
        this.rusd = new web3.eth.Contract(iTokenDelegator.abi, rUSDToken)
        await this.usdt.methods.approve(this.pool.address, constants.MAX_UINT256).send({ from: alice })
        await this.usdt.methods.approve(this.bank.address, constants.MAX_UINT256).send({ from: alice })
        await this.rusd.methods.approve(this.bank.address, constants.MAX_UINT256).send({ from: bob })
    })

    it('usdt info', async () => {
        await this.usdt.methods.allowance(alice, this.pool.address).call().then(console.log)
        await this.usdt.methods.allowance(alice, this.bank.address).call().then(console.log)
    })

    it('user info', async () => {
        console.log(`USDT Token:`)
        await this.usdt.methods.balanceOf(alice).call().then((result) => { console.log(`alice Balance:${result.toString()}`) })
        await this.usdt.methods.balanceOf(bob).call().then((result) => { console.log(`bob Balance:${result.toString()}`) })

        console.log(`\nRICE Token:`)
        await this.rice.balanceOf(alice).then((result) => { console.log(`alice Balance:${result.toString()}`) })
        await this.rice.balanceOf(bob).then((result) => { console.log(`bob Balance:${result.toString()}`) })

        console.log(`\nrUSD Token:`)
        await this.rusd.methods.balanceOf(alice).call().then((result) => { console.log(`alice Balance:${result.toString()}`) })
        await this.rusd.methods.balanceOf(bob).call().then((result) => { console.log(`bob Balance:${result.toString()}`) })
    })

    it.skip('seed usdt borrow rUSD', async () => {
        await this.pool.deposit(0, ether('500'))
        await this.bank.borrow(0, ether('325'))
    })

    it('collectDebt', async () => {
        // await this.pool.deposit(0, ether('500'), { from: alice })
        // await this.bank.borrow(0, ether('325'), { from: alice })
        let currentTime = (await time.latest()).toNumber()
        // time.increase()
        await this.bank.collectDebt(0, 0, { from: bob })
    })
});