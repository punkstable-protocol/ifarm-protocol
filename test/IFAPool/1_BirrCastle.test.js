const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const IFABank = artifacts.require('IFABank');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const MockERC20 = artifacts.require('MockERC20');
const BirrCastle = artifacts.require('BirrCastle');
const AdareManor = artifacts.require('AdareManor');
const VillaFarnese = artifacts.require('VillaFarnese');
const BN = web3.utils.BN;
const uniswapV2Factory = require('../contractsJson/UniswapV2Factory.json')
const UniswapPairJson = require('../contractsJson/UniswapPairAbi.json')
const iTokenJson = require('../contractsJson/iTokenDelegator.json')



function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
}

const uniswapsAddress = {
    'uniswapV2Factory': "0xBBa9c67e95e3D997a8Af1D1AB0A0b5076A60BAB2",
    'uniswapV2Router': "0xDbA9FC3A3f07a2b9d085C78CE488b9D145430ECc",
}

const publicAddress = {
    "IFAMaster": "0xC026929704A4a389a200b09580ebd8807F7b46bC",
    "IFAPool": "0x74818a2f6501aEbA1B1243a4d55426Afd72d939C",
    "IFABank": "0x03E48785b2888BBf8553EfAAFceAd27D49a5D732",
    "IFARevenue": "0xdec7e0c07DAF10f01A53529940d27a939113877d",
    "Costco": "0xA94bcF5f96Fc1C9986d1230271E19222a21E012e",
    "IFADataBoard": "0xd70Ed31d60EaB68e06264Cf7A74e34d15D0dfCe8",
    "CreateIFA": "0x71A9fab2434c0Aa37173699514a161c9cdeecA54",
    "ShareRevenue": "0x9f35fA0702C0AcF5995f64698d29214b34bbD04d"
}
const poolVaults = {
    "BirrCastle": "0x1551C4689aF2cA0FD044ccCfede20aAf91560c0F",
    "Sunnylands": "0x981237DB582f8df25808D78ae0A1BBbf04BC159a",
    "ChateauLafitte": "0x619fbB13579dbFF77B154d7c06036D9fc5291071",
    "AdareManor": "0x614c4316DEeCFE645180bb8d7f2d1664cF7bF423",
    "VillaDEste": "0xeBA68bcD7CbA2ACC34E30458e4eaD9655Ef8e11D",
    "VillaLant": "0x423653202fCAbCd155Bc3745eE267543b92BfDa4",
    "VillaFarnese": "0x553a8b5BFc030303B3E631Cd22733D7f2EE4e64F",
    "ChatsworthHouse": "0x73E0E4DDAe1ad09D738B6DB4b30C3b6f22cE66DD",
    "ChateauMargaux": "0xF64C16533cDd4b70F6BB7C586785237E33Ce57A2"
}

const itokensAddress = {
    'iETH': "0xc257BCf9EEEbC727C14BA4451298ec70534540eC",
    'iBTC': "0x3362599C498AaE2087ace38CEff19FcE08FfD0ae",
    'iUSD': "0xB178B47afbc33BDd036D178E4F48d3086e3beFF5",
}

const tokensAddress = {
    "DAI": "0xe5737F0f694897331FE28640D2164B1404F23Dc0",
    "wBTC": "0xe65b25FE4bec1F5aC9364304a175d68b582f5d0a",
    "wETH": "0x9004529746a3d2496E46248929a3a57Cd30B0d0f",
    "IFA": "0x567E6A969170217862632cFE93b6e36B9565e262",
    "USD": "0x7F4939cFE161A7159B5e156b99B6fbE0694c239c"
}

const lpTokenAddress = {
    "iUSD_DAI": "0xF8C8106FCcb36a2158b03D5F3608FDc46914E984",
    "iBTC_wBTC": "0x5F7Cf94076517478e5103aC59dB14CfaFD52D811",
    "iETH_ETH": "0x6570b812649a422C1ab09CdE590328d0E40d4D20",
    "IFA_DAI": "0xaAC6eC6F6d363F179f29b00c050Cc956E1f87eaa",
    "IFA_wBTC": "0x6499F9C7893906B219A731abB03c0f6D93aCf6c8",
    "IFA_ETH": "0xbB0316F0eD3d9f332A929648a035Db899C787384"
}

contract('BirrCastle pool[number:1], DAI token', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const poolId = 0;

    async function createPair(token0, token1) {
        this.factory = new web3.eth.Contract(uniswapV2Factory.abi, uniswapsAddress.uniswapV2Factory)
        let pairAddress = await this.factory.methods.getPair(token0, token1).call();
        if (pairAddress.toString() == '0x0000000000000000000000000000000000000000') {
            pairAddress = await factory.methods.createPair(token0, token1).send({ from: alice, gas: 6000000 })
        }
        return pairAddress.toString()
    }

    async function addLiquidity(token0, token0Amount, token1, token1Amount) {
        await token0.transfer(pair.address, token0Amount)
        await token1.transfer(pair.address, token1Amount)
        await pair.mint(alice, { from: alice })
    }

    before(async () => {
        let approveAmount = toWei('99990000');
        this.DAI = await MockERC20.at(tokensAddress.DAI);
        this.iUSD = new web3.eth.Contract(iTokenJson.abi, itokensAddress.iUSD)
        this.BirrCastle = await BirrCastle.at(poolVaults.BirrCastle);
        //from alice transfer sCRV 100 ether to bob and carol
        await this.DAI.transfer(bob, toWei('100'), { from: alice });
        await this.DAI.transfer(carol, toWei('100'), { from: alice });

        this.pool = await IFAPool.at(publicAddress.IFAPool);
        this.bank = await IFABank.at(publicAddress.IFABank);
        this.ifa = await IFAToken.at(tokensAddress.IFA);

        // approve 
        await this.DAI.approve(this.pool.address, approveAmount, { from: alice });
        await this.DAI.approve(this.bank.address, approveAmount, { from: alice });

        //uniswap
        // let amount = toWei('10')
        // let daiIFAPairAddress = await createPair(this.DAI.address, tokensAddress.IFA)
        // let daiIUSDPairAddress = await createPair(this.DAI.address, itokensAddress.iUSD)
        // this.DAI.transfer(daiIFAPairAddress, amount)
        // this.ifa.transfer(daiIFAPairAddress, amount)
        // let daiIFAPair = new web3.eth.Contract(UniswapPairJson.abi, daiIFAPairAddress)
        // await daiIFAPair.methods.mint(alice).send({ from: alice, gas: 6000000 })

        // this.DAI.transfer(daiIUSDPairAddress, amount)
        // this.iUSD.methods.transfer(daiIUSDPairAddress, amount).send({ from: alice, gas: 6000000 })
        // let daiIUSDPair = new web3.eth.Contract(UniswapPairJson.abi, daiIUSDPairAddress)
        // await daiIUSDPair.methods.mint(alice).send({ from: alice, gas: 6000000 })
    });

    context('seed of token or token harvest IFA', async () => {
        it.skip('Single user deposit', async () => {
            let amount = toWei('10')
            let balanceOf = await this.ifa.balanceOf(bob)
            console.log(`balanceOf:${balanceOf.toString()}`)
            await this.pool.deposit(poolId, amount, { from: bob });
            await time.advanceBlock(); // block + 1
            await time.advanceBlock(); // block + 1
            await this.pool.claim(poolId, { from: bob });
            balanceOf = await this.ifa.balanceOf(bob)
            console.log(`balanceOf:${balanceOf.toString()}`)
        });

        it('borrow', async () => {
            let amount = toWei('10')
            await this.pool.deposit(poolId, amount, { from: alice });
            await this.bank.borrow(0, amount, { from: alice });
            let lockedAmount = await this.BirrCastle.lockedAmount(alice);
            console.log(`lockedAmount:${lockedAmount.toString()}`);
        });

        it.only('payBackPartially', async () => {
            await this.bank.payBackInFull(0, { from: alice });
        });

    });

});