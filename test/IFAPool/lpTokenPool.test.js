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
    "ifaMaster": "0xF8790D405E1457B8391573f4667d514fEDF9e89b",
    "ifaPool": "0xE8Da347219bdD7Cc24461Af210c0CD54E09A050F",
    "ifaBank": "0xf5EfBB978e91F304B0e63DC978184172Edb0Eb6d",
    "ifaRevenue": "0x257d3D33bCfC708CD7b2dc7746f15f2Bd576395C",
    "costco": "0x131890421Ba24038b04E67A0671818bF84F2320C",
    "ifaDataBoard": "0x718a3067409b9066C95173DE2fcAF33C30a9eBc7",
    "createIFA": "0x03347758c558fBC62A27333277383aD7d21f013A",
    "shareRevenue": "0x1E5134602d8b870884a7e9a89Be06c9cEFDE4c55"
}
const poolVaults = {
    "Birr Castle": "0xE05a52A8DD5AA18fE9157fc19150Df548cFbbebb",
    "Sunnylands": "0xc602b3C0d1C5Caac28f12d59c1DE9d3aae2545BC",
    "Château Lafitte": "0xedfF9DCbFC41d71CB6c34C4EacbDfB8246052140",
    "Adare Manor": "0x43a898A3e3Fc8CF04d13c15593D6a154f140eE12",
    "Villa D'Este": "0x63714E48053733ae70E17be3dA93216d75f9e13a",
    "Villa Lant": "0x7cF03FbE16269B733f4BC3752A85333a484596Ce",
    "Villa Farnese": "0x65E7B773C55b0483C78872cd2f28413950e10072",
    "Chatsworth House": "0x4E8b8955ACDfCf4A1DFBe232623C1519299A448C",
    "Chateau Margaux": "0xb980E3496398656624d11529497dD81930Da90f6"
}

const tokensAddress = {
    'DAI': '0xe5737F0f694897331FE28640D2164B1404F23Dc0',
    'wBTC': '0xe65b25FE4bec1F5aC9364304a175d68b582f5d0a',
    'wETH': '0x9004529746a3d2496E46248929a3a57Cd30B0d0f',
    'IFA': '0x567E6A969170217862632cFE93b6e36B9565e262',
    'USD': '0x7F4939cFE161A7159B5e156b99B6fbE0694c239c'
}

const lpTokenAddress = {
    "iUSD_DAI": "0xF8C8106FCcb36a2158b03D5F3608FDc46914E984",
    "iBTC_wBTC": "0x5F7Cf94076517478e5103aC59dB14CfaFD52D811",
    "iETH_ETH": "0x6570b812649a422C1ab09CdE590328d0E40d4D20",
    "IFA_DAI": "0xaAC6eC6F6d363F179f29b00c050Cc956E1f87eaa",
    "IFA_wBTC": "0x6499F9C7893906B219A731abB03c0f6D93aCf6c8",
    "IFA_ETH": "0xbB0316F0eD3d9f332A929648a035Db899C787384"
}

contract('lp token Pool', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const POOL_ID = 3;

    before(async () => {
        this.decimals = new BN((10 ** 18).toString());
        // Fake Wrapped amount 200000 ether, decimals 18
        let totalSupply = toWei('200000');
        this.iUSD_DAI = await MockERC20.at(lpTokenAddress.iUSD_DAI);
        this.IFA_DAI = await MockERC20.at(lpTokenAddress.IFA_DAI);
        //from alice transfer sCRV 100 ether to bob and carol
        await this.iUSD_DAI.transfer(bob, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(carol, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(breeze, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(joy, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(weifong, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(mickjoy, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(vk, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(atom, toWei('100'), { from: alice });
        await this.iUSD_DAI.transfer(jk, toWei('100'), { from: alice });

        await this.IFA_DAI.transfer(bob, toWei('100'), { from: alice });


        this.ifaMaster = await IFAMaster.at(publicAddress.ifaMaster);
        this.pool = await IFAPool.at(publicAddress.ifaPool);
        this.ifa = await IFAToken.at(tokensAddress.IFA);
        this.createIFA = await CreateIFA.at(publicAddress.createIFA);
        this.costco = await Costco.at(publicAddress.costco);
        this.ifaDataBoard = await IFADataBoard.at(publicAddress.ifaDataBoard);
        this.AdareManor = await AdareManor.at(poolVaults["Adare Manor"]);
        this.villaFarnese = await VillaFarnese.at(poolVaults["Villa Farnese"])
        await this.createIFA.approve(this.iUSD_DAI.address, { from: alice });
    });

    context('seed of token or lp token harvest IFA', async () => {
        it('Single user pool 4', async () => {
            let amount = toWei('10')
            let balanceOf = await this.ifa.balanceOf(bob)
            console.log(`balanceOf:${balanceOf.toString()}`)
            await this.iUSD_DAI.approve(this.pool.address, amount, { from: bob });
            await this.pool.deposit(3, amount, { from: bob });
            await time.advanceBlock(); // block + 1

            await this.pool.claim(3, { from: bob });
            balanceOf = await this.ifa.balanceOf(bob)
            console.log(`balanceOf:${balanceOf.toString()}`)
        });

        it('Single user pool 7', async () => {
            let amount = toWei('10')
            let balanceOf = await this.ifa.balanceOf(bob)
            console.log(`balanceOf:${balanceOf.toString()}`)
            await this.IFA_DAI.approve(this.pool.address, amount, { from: bob });
            await this.pool.deposit(6, amount, { from: bob });
            await time.advanceBlock(); // block + 1

            await this.pool.claim(6, { from: bob });
            balanceOf = await this.ifa.balanceOf(bob)
            console.log(`balanceOf:${balanceOf.toString()}`)
        })

    });

});