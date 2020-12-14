const { expectRevert, time } = require('@openzeppelin/test-helpers');
const CreateIFA = artifacts.require('CreateIFA');
const IFAToken = artifacts.require('IFAToken');
const IFAPool = artifacts.require('IFAPool');
const Costco = artifacts.require('Costco');
const IFAMaster = artifacts.require('IFAMaster');
const IFADataBoard = artifacts.require('IFADataBoard');
const MockERC20 = artifacts.require('MockERC20');
const BirrCastle = artifacts.require('BirrCastle');
const AdareManor = artifacts.require('AdareManor');
const VillaFarnese = artifacts.require('VillaFarnese');
const BN = web3.utils.BN;

function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
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

contract('AdareManor pool[number:4], lp token', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const poolId = 3;

    before(async () => {
        let approveAmount = toWei('99990000');
        this.iUSD_DAI = await MockERC20.at(lpTokenAddress.iUSD_DAI);
        //from alice transfer sCRV 100 ether to bob and carol
        await this.iUSD_DAI.transfer(bob, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(carol, toWei('100'), { from: alice });

        this.pool = await IFAPool.at(publicAddress.IFAPool);
        this.ifa = await IFAToken.at(tokensAddress.IFA);

        // approve 
        await this.iUSD_DAI.approve(this.pool.address, approveAmount, { from: alice });
        await this.ifa.approve(this.pool.address, approveAmount, { from: alice });
    });

    context('seed of token or lp token harvest IFA', async () => {
        it('Single user deposit', async () => {
            let amount = toWei('10')
            let balanceOf = await this.ifa.balanceOf(alice)
            console.log(`balanceOf:${balanceOf.toString()}`)
            await this.pool.deposit(poolId, amount, { from: alice });
            await time.advanceBlock(); // block + 1
            await time.advanceBlock(); // block + 1
            await this.pool.claim(poolId, { from: alice });
            balanceOf = await this.ifa.balanceOf(alice)
            console.log(`balanceOf:${balanceOf.toString()}`)
        });

    });

});