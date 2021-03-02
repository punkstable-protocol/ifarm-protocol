const IFADataBoard = artifacts.require('IFADataBoard');

function toWei(bigNumber) {
    return web3.utils.toWei(bigNumber);
}

contract('IFADataBoard', ([alice, bob, carol, breeze, joy, weifong, mickjoy, vk, atom, jk]) => {
    const Decimals = 10**18
    const ifaDataBoardContract = '0x313273f448c94721ABaBcc533d67Cd187d98d7c4'
    const rUSDToken = '0x4d97D3bf4A0bD87F9DEBb16873BdfE24127C9307'
    const rBTCToken = '0x7d1E2717322a9155242A1853a28A0148a10Efb61'
    const HUSDToken = '0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047'
    const USDTToken = '0xa71EdC38d189767582C38A3145b5873052c3e47a'

    beforeEach(async () => {
        this.ifaDataBoard = new web3.eth.Contract(IFADataBoard.abi, ifaDataBoardContract)
    });

    context('get token price', async () => {
        it('get 1 rUSD price usd', async () => {
            let rUSDPrice = await this.ifaDataBoard.methods.getTokenPrice(rUSDToken).call()
            rUSDPrice = rUSDPrice / Decimals
            console.log(rUSDPrice.toString())
        });

        it('get 1 rBTC price usd', async () => {
            let rBTCPrice = await this.ifaDataBoard.methods.getTokenPrice(rBTCToken).call()
            rBTCPrice = rBTCPrice / Decimals
            console.log(rBTCPrice.toString())
        });

        it('get 1 eth price usd', async () => {
            let ETHPrice = await this.ifaDataBoard.methods.getEthPrice().call()
            ETHPrice = ETHPrice / Decimals
            console.log(ETHPrice.toString())
        });
        it('get 1 husd price usdt', async ()=>{
            let HUSDPrice = await this.ifaDataBoard.methods.getTokenPrice(HUSDToken).call()
            HUSDPrice = HUSDPrice / Decimals
            console.log(HUSDPrice.toString())
        });
    });

    context('get APY', async () => {
        it('0 pool APY',async ()=>{
            let apy = await this.ifaDataBoard.methods.getAPY(0,HUSDToken,false).call()
            console.log(`apy:${apy.toString()}`)
        });
    });

});