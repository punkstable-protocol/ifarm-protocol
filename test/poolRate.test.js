const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const iTokenDelegator = require("../test/contractsJson/iTokenDelegator.json");
const IFAPool = artifacts.require("IFAPool")
const IFAVault = artifacts.require("IFAVault")
const IFAToken = artifacts.require("IFAToken")
const MockERC20 = artifacts.require("MockERC20")
const CreateIFA = artifacts.require("CreateIFA")

const contractAddress = {
    "uniswap": {
        "factory": "0x223a74cab41a9AE8ca339c7F0c1a99E6AF7D8d6C",
        "router": "0x61b305165D158bee6e78805530DaDcBf42B858B9"
    },
    "itokensAddress": {
        "rETH": "0xB66f9B19d0E5bB477E2e24227A4CE8416efF5c45",
        "rBTC": "0xb2Cb15fE82ffCD7f0498CcDedf77B339458947B4",
        "rUSD": "0xf88E0663C5E13ce74277d6881523E191B29bbaBA"
    },
    "tokensAddress": {
        "HUSD": "0xb74841282cA7d81D7Bfb1b129C5929F79f090CCD",
        "HBTC": "0x1ef1f4989CeFD41d2997731029f7C5367EB0Ae68",
        "HETH": "0x08356b1F5Fc8B41076f7f1f034799EDa0eE115e4",
        "WHT": "",
        "RICE": "0x274AA9E2E9d81B6C871425Aa71251fb5a41e0a1C",
        "USDT": "0xd036c737F631C82FAcA138b7bBd1e068A0Ae1F2F"
    },
    "lpTokenAddress": {
        "rUSD_USDT": "0x51c54C361c66cEd2551695b46260e1a3EFF2F1f5",
        "rBTC_HBTC": "0x7C9D92a4e1c52dC723A3FB2710405970D3d8a45D",
        "rETH_HETH": "0xF080C292203D36B823a1633dfF8DC4922EcdE461",
        "RICE_rUSD": "0x81e33cDEF482Ed0C6578354082f3C121d58F56a3",
        "RICE_rBTC": "0x72ccFDFD274FCccF22c4Da07Dd3C161D80dFb174",
        "RICE_rETH": "0x94B7468247b63Ad0d1c8602C89805EF7cEB820d0"
    },
    "public": {
        "IFAMaster": "0x51363a457827B1BB758Bc904e4A6a1193E40705B",
        "IFAPool": "0xDE9BC0928093986A46CdB0eFa423589b2fDe9C47",
        "IFABank": "0x4f3D95d11309E7116d48667Dc483A6236CC94eF8",
        "IFARevenue": "0x2Fa092f4e04cd7AD80A1CA3725c3c5b7d48fade1",
        "Costco": "0x690D6ECB69E439813e29C1d390ad30688976f2c1",
        "IFADataBoard": "0x49513156B82C2AA1eaC145Bf0012e49EB927B1e6",
        "CreateIFA": "0x690C3439489d61D045F9798D0504ACE2cC5E2332",
        "ShareRevenue": "0xB2bE1617F7E761d8Ea18a7a55c8fb1aD0462948F",
        "Parities": "0xc63149c6086769a44fAd8af0EBB236042848A3dD"
    },
    "poolVaults": {
        "BirrCastle": "0x4746041A28a7823c836D4dA60727DC7a90402c26",
        "Sunnylands": "0xeCd8473935E5Ab8F06858618a18EAEb88c4B47f4",
        "ChateauLafitte": "0x038Ef7Be6b72e049Ac175f56248C6B7D73aeBF54",
        "AdareManor": "0xc5CFd47F1Fa1cbfb83f2Cf557A0Fb41acd6518EA",
        "VillaDEste": "0x8886075A9B4FBBA9eBD76a78566e57eF4148A792",
        "VillaLant": "0xf495eE0c340C2b80132BA82AF8551077DbD7EEAa",
        "VillaFarnese": "0x9278A328f8b62933EEC8E120c0c6A6803dd49ec7",
        "ChatsworthHouse": "0x4C527E7138d417b7800E410375C51B19Ff6C6F63",
        "ChateauMargaux": "0x66dCBF717cE4cC9ee446C328A546389fE6536c13"
    },
    "calculatorsAddress": {
        "BirrCastleCalculators": "0xB856f32652BD848DE148BA1fDbFb0028D3E31Cf5",
        "SunnylandsCalculators": "0x7bF043e64De8033CC5FD463f72dbE739bc1CB8e7",
        "ChateauLafitteCalculators": "0xf156169cd3211E768F006f5F8086FB3F764F741e"
    }
}

function ContractAt(_abi, _address) {
    return new web3.eth.Contract(_abi, _address)
}

contract('pool rate test cases', ([alice, bob]) => {
    before(async () => {
        this.seedTokens = []
        this.seedTokens.push(ContractAt(iTokenDelegator.abi, contractAddress.tokensAddress.HUSD))
        this.seedTokens.push(ContractAt(iTokenDelegator.abi, contractAddress.tokensAddress.HBTC))
        this.seedTokens.push(ContractAt(iTokenDelegator.abi, contractAddress.tokensAddress.HETH))
        this.seedTokens.push(ContractAt(MockERC20.abi, contractAddress.lpTokenAddress.rUSD_USDT))
        this.seedTokens.push(ContractAt(MockERC20.abi, contractAddress.lpTokenAddress.rBTC_HBTC))
        this.seedTokens.push(ContractAt(MockERC20.abi, contractAddress.lpTokenAddress.rETH_HETH))
        this.seedTokens.push(ContractAt(MockERC20.abi, contractAddress.lpTokenAddress.RICE_rUSD))
        this.seedTokens.push(ContractAt(MockERC20.abi, contractAddress.lpTokenAddress.RICE_rBTC))
        this.seedTokens.push(ContractAt(MockERC20.abi, contractAddress.lpTokenAddress.RICE_rETH))
        for (let i = 0; i < this.seedTokens.length; i++) {
            this.seedTokens[i].address = this.seedTokens[i].options.address
        }

        this.poolVaults = [
            await IFAVault.at(contractAddress.poolVaults.BirrCastle),
            await IFAVault.at(contractAddress.poolVaults.Sunnylands),
            await IFAVault.at(contractAddress.poolVaults.ChateauLafitte),
            await IFAVault.at(contractAddress.poolVaults.AdareManor),
            await IFAVault.at(contractAddress.poolVaults.VillaDEste),
            await IFAVault.at(contractAddress.poolVaults.VillaLant),
            await IFAVault.at(contractAddress.poolVaults.VillaFarnese),
            await IFAVault.at(contractAddress.poolVaults.ChatsworthHouse),
            await IFAVault.at(contractAddress.poolVaults.ChateauMargaux),
        ]

        this.poolProxy = await IFAPool.at(contractAddress.public.IFAPool)
        this.IFAToken = await IFAToken.at(contractAddress.tokensAddress.RICE)
        this.CreateIFA = await CreateIFA.at(contractAddress.public.CreateIFA)
    });

    it('logs', async () => {
        // print tokens balance
        for (let i = 0; i < this.seedTokens.length; i++) {
            let tokenBalance = await this.seedTokens[i].methods.balanceOf(alice).call()
            console.log(`id: ${i} balance-> ${tokenBalance.toString()}`)
        }

        // print pool allowance amount
        for (let i = 0; i < this.seedTokens.length; i++) {
            let allowance = await this.seedTokens[i].methods.allowance(alice, this.poolVaults[i].address).call()
            console.log(`id: ${i} allowance-> ${allowance.toString()}`)
        }

        // print pool allocPoint
        for (let i = 0; i < this.poolVaults.length; i++) {
            let totalAllocPoint = await this.CreateIFA.totalAllocPoint()
            let poolInfo = await this.CreateIFA.poolMap(this.poolVaults[i].address)
            let allocPoint = poolInfo.allocPoint
            console.log(`pool id: ${i}, allocPoint:${allocPoint}, totalAllocPoint: ${totalAllocPoint}`)
        }
    });

    it.skip('single pool seed', async () => {
        let poolid = 1
        await this.seedTokens[poolid].methods.approve(this.poolProxy.address, ether('90000000')).send({ from: alice, gas: 3000000 })
        await this.poolProxy.deposit(poolid, ether('1'), { from: alice })
        await this.poolProxy.claim(poolid, { from: alice })
        let seedAmount = await this.poolVaults[0].balanceOf(alice)
        await this.poolProxy.withdraw(poolid, seedAmount, { from: alice })
    });

    it('seed ether', async () => {
        // all tokens approve 
        for (let i = 0; i < this.seedTokens.length; i++) {
            await this.seedTokens[i].methods.approve(this.poolProxy.address, ether('90000000')).send({ from: alice, gas: 3000000 })
        }

        // await this.poolProxy.deposit(0, ether('1'), { from: alice })
        for (let i = 0; i < this.poolVaults.length; i++) {
            let reicReward = 0
            let reicBalance = await this.IFAToken.balanceOf(alice)
            await this.poolProxy.deposit(i, ether('1'), { from: alice })
            await time.advanceBlock()       // block + 1
            // await this.poolProxy.claim(i, { from: alice })
            let seedAmount = await this.poolVaults[i].balanceOf(alice)
            await this.poolProxy.withdraw(i, seedAmount, { from: alice })
            reicReward = (await this.IFAToken.balanceOf(alice)) - reicBalance
            console.log(`pool id:${i} reicReward:${reicReward.toString()}`)
            // console.log(`pool id: ${i}, testing complete`)
        }
    });

    it.skip('pendingValuePerShare', async () => {
        // await this.poolProxy.deposit(0, ether('1'), { from: alice })
        for (let i = 0; i < this.poolVaults.length; i++) {
            let startBlock = await time.latestBlock()
            await this.poolProxy.deposit(i, ether('1'), { from: alice })
            let seedAmount = await this.poolVaults[i].balanceOf(alice)
            await time.advanceBlock()       // block + 1
            let getValuePerShare = await this.CreateIFA.getValuePerShare(this.poolVaults[i].address)
            await this.poolProxy.withdraw(i, seedAmount, { from: alice })
            let endBlock = await time.latestBlock()
            console.log(`pool id:${i} reicReward:${getValuePerShare.toString()}, blockMultiplier:${endBlock - startBlock}`)
            // console.log(`pool id: ${i}, testing complete`)
        }
    });
});