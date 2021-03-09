const { balance, ether, constants } = require("@openzeppelin/test-helpers")
const IFAPool = artifacts.require("IFAPool")
const IFABank = artifacts.require("IFABank")
const MockERC20 = artifacts.require("MockERC20")

const IFAPoolAddress = "0x2B13BE215D70dcDcC6B30F13D84b52c17D4f2173"
const IFABankAddress = "0xa9826Ca657aC4F394E3BE10309A98BF94512bA44"
const SeedToken = "0xcDb5755bbE46DD441F292E8593B8696eC1dd5140"          //usdt

contract('loanBar contract test', ([alice, bob]) => {
    before(async () => {
        this.bank = await IFABank.at(IFABankAddress)
        this.pool = await IFAPool.at(IFAPoolAddress)
        this.usdt = new web3.eth.Contract(MockERC20.abi, SeedToken)
    })

    it('usdt info', async () => {
        await this.usdt.methods.balanceOf(alice).call().then(console.log)
        await this.usdt.methods.allowance(alice, this.pool.address).call().then(console.log)
        await this.usdt.methods.allowance(alice, this.bank.address).call().then(console.log)
    })

    it('seed usdt borrow rUSD', async () => {
        await this.usdt.methods.approve(this.pool.address, constants.MAX_UINT256).send({ from: alice })
        await this.usdt.methods.approve(this.bank.address, constants.MAX_UINT256).send({ from: alice })
        await this.pool.deposit(0, ether('500'))
        await this.bank.borrow(0, ether('325'))
    })
});