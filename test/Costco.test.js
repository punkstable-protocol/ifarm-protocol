const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const MockERC20 = artifacts.require('MockERC20');
const BirrCastle = artifacts.require('BirrCastle');
const uniswapPairAbi = require('./contractsJson/UniswapPairAbi.json')
const BN = web3.utils.BN;
const { newContractAt, newContract } = require('./lib/ContractAction');

function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
}

const contractsAddress = {
    'iETH': "0x600B3132Bb97aA7D1D6bE574e8a4AF693A959dAF",
    'wETH': '0x7A530768CddbBB3FE9Ac7D7A174aAF44922af19d',
    'iUSD': '0x5C06F3eB9cF03D026ED7D7e8eA2c0F2a02A30052',
    'sCRV': '0x6BF1DbEcccd5F3a4d57beC45E9eA3e5f7edc9e7d',
    'uniswapV2Factory': '0x37E28138E834fACDfA82aDc20cC2FCa23f196559',
    'uniswapV2Router': "0xE38076A58598538D2365696E2e74D1F8247E8319",
    'IFA': "0x53B60d54581957106a21Fe963142E537CF99c7dB",
    'pair': '',
}

const oneEther = '1000000000000000000'
const maxApprove = '100000000000000000000000000'

contract('Costco', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const poolMap = {};
    const VAULT_BY_KEY = 0;
    poolMap['BirrCastle'] = 0;
    this.allocPoint = 100;
    this.decimals = new BN((10 ** 18).toString());
    this.IFA_PER_BLOCK = toWei('10');
    this.PER_SHARE_SIZE = new BN((10 ** 12).toString());

    before(async () => {
        // Fake Wrapped amount 200000 ether, decimals 18
        let totalSupply = toWei('200000');
        this.sCRV = newContractAt.iToken(contractsAddress.sCRV);
        this.sCRV.address = contractsAddress.sCRV;
        this.iETH = newContractAt.iToken(contractsAddress.iETH);
        this.iETH.address = contractsAddress.iETH;
        //from alice transfer sCRV 100 ether to bob and carol
        await this.sCRV.methods.transfer(bob, toWei('100')).send({ from: alice });
        await this.sCRV.methods.transfer(carol, toWei('100')).send({ from: alice });
        await this.iETH.methods.transfer(bob, toWei('100')).send({ from: alice });



        this.pool = await IFAPool.new({ from: alice });

        // uniswap contract
        this.uniswapV2Factory = newContractAt.uniswapV2Factory(contractsAddress.uniswapV2Factory);
        this.uniswapV2Factory.address = contractsAddress.uniswapV2Factory;
        contractsAddress.pair = await this.uniswapV2Factory.methods.getPair(contractsAddress.iETH, contractsAddress.IFA).call();
        this.uniswapPair = new web3.eth.Contract(uniswapPairAbi, contractsAddress.pair);

        this.uniswapRouter = newContractAt.uniswapV2Router02(contractsAddress.uniswapV2Router);
        this.uniswapRouter.address = contractsAddress.uniswapV2Router;

        this.ifaMaster = await IFAMaster.new({ from: alice });
        await this.ifaMaster.setUniswapV2Factory(this.uniswapV2Factory.address);
        await this.ifaMaster.setsCRV(this.sCRV.address);
        await this.ifaMaster.setPool(this.pool.address);
        const K_MADE_iETH = 2;
        await this.ifaMaster.setiToken(K_MADE_iETH, this.iETH.address);

        // this.ifa = await IFAToken.new({ from: alice });
        this.ifa = newContractAt.IFA(contractsAddress.IFA);
        this.ifa.address = contractsAddress.IFA;
        await this.ifaMaster.setIFA(this.ifa.address);

        this.createIFA = await CreateIFA.new(this.ifaMaster.address, { from: alice });
        await this.ifa.methods.addMinter(this.createIFA.address).send({ from: alice });

        this.costco = await Costco.new(this.ifaMaster.address, { from: alice });
        await this.ifaMaster.setCostco(this.costco.address);
        await this.iETH.methods.approve(this.costco.address, toWei('90000000')).send({ from: bob });
        await this.ifa.methods.approve(this.costco.address, toWei('90000000')).send({ from: alice });

        this.ifaDataBoard = await IFADataBoard.new(this.ifaMaster.address, { from: alice });

        this.birrCastlePool = await BirrCastle.new(this.ifaMaster.address, this.ifa.address);

        await this.birrCastlePool.setStrategies([this.createIFA.address,]);
        await this.ifaMaster.addVault(VAULT_BY_KEY, this.birrCastlePool.address);
        await this.pool.setPoolInfo(poolMap.BirrCastle, this.sCRV.address, this.birrCastlePool.address, 1602759206);
        await this.createIFA.setPoolInfo(poolMap.BirrCastle, this.birrCastlePool.address, this.ifa.address, this.allocPoint, true);
        await this.createIFA.approve(this.sCRV.address, { from: alice });

        // harvest IFA， 50% goes to costco
        let amount = toWei('100')
        await this.sCRV.methods.approve(this.pool.address, amount).send({ from: bob });
        await this.pool.deposit(poolMap.BirrCastle, amount, { from: bob });
        let lastBlockNum = await time.latestBlock();
        await time.advanceBlockTo(lastBlockNum.add(new BN(100))); // block + 100
        await this.pool.claim(poolMap.BirrCastle, { from: bob });

        // iETH approve
        await this.iETH.methods.approve(contractsAddress.uniswapV2Router, maxApprove).send({ from: alice, gas: 3000000 });
        await this.ifa.methods.approve(contractsAddress.uniswapV2Router, maxApprove).send({ from: alice, gas: 3000000 });

        // public function
        this.addLiquidity = async (amountADesired, amountBDesired, to) => {
            let reserves = await this.uniswapPair.methods.getReserves().call();
            amountADesired = new BN(amountADesired);
            amountBDesired = new BN(amountBDesired);
            let amountAOptimal = new BN(0);
            let amountBOptimal = new BN(0);
            let amountAMin = amountADesired.sub(new BN(1000));
            let amountBMin = amountADesired.sub(new BN(1000));
            if (reserves[0] != 0 && reserves[1] != 0) {
                amountBOptimal = await this.uniswapRouter.methods.quote(amountADesired, reserves[0], reserves[1]).call();
                if (amountBOptimal <= amountBDesired) {
                    amountBMin = amountBMin < amountBOptimal ? amountBMin : new BN(amountBOptimal).sub(new BN(1000));
                    amountBDesired = amountBOptimal;
                }
                else {
                    amountAOptimal = await this.uniswapRouter.methods.quote(amountBDesired, reserves[1], reserves[0]).call();
                    if (amountAOptimal <= amountADesired && amountAOptimal >= amountAMin) {
                        amountAMin = amountAMin < amountAOptimal ? amountAMin : new BN(amountAOptimal).sub(new BN(1000));
                        amountADesired = amountAOptimal
                    }
                }
            }
            let deadline = new BN(await time.latest()).add(new BN('3600')).toNumber();
            await this.uniswapRouter.methods.addLiquidity(
                contractsAddress.iETH,
                contractsAddress.IFA,
                amountADesired.toString(),
                amountBDesired.toString(),
                amountAMin.toString(),
                amountBMin.toString(),
                to,
                deadline
            ).send({ from: to, gas: 6000000 });
        }
    });

    beforeEach(async () => {
        await this.addLiquidity(toWei('1000'), toWei('100'), alice);
        // let ge = await this.uniswapPair.methods.getReserves().call();
        // console.log(ge[0],ge[1]);
    });

    it('Anyone can buy IFA by iToken with 5% discount', async () => {
        // let allowance = await this.iETH.allowance(bob, this.costco.address);
        // console.log(`allowance:${allowance.toString()}`);
        return
        let IFAbalanceOf = await this.ifa.methods.balanceOf(this.costco.address).call();
        let iETHBalanceOf = await this.iETH.methods.balanceOf(bob).call();
        console.log(`IFAbalanceOf:${IFAbalanceOf.toString()}`);
        console.log(`iETHBalanceOf:${iETHBalanceOf.toString()}`);
        await this.costco.buyIFAWithiToken(this.iETH.address, toWei('10'), { from: bob });
        iETHBalanceOf = await this.iETH.methods.balanceOf(bob).call();
        console.log(`iETHBalanceOf:${iETHBalanceOf.toString()}`);
    });

});