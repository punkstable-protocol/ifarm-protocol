const { expectRevert, time } = require('@openzeppelin/test-helpers');

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
        "HUSD": "0x04B62be75C7315aacFB693b06084d96f2B726c56",
        "HBTC": "0xC19F91C5baF64ed45bc1d3954e091842423aca3E",
        "HETH": "0x59D88d6F00D7ddc1833030C0B1C52Cc37CD74525",
        "WHT": "",
        "RICE": "0x0d8dFA3ba977b54EdC5042316F81Db30B515e65f",
        "USDT": "0x141B7A7e24f55C1CBAbd679E6212dBC4C51F3c79"
    },
    "lpTokenAddress": {
        "rUSD_USDT": "0x3360f7363c165387114034e53F60f54f0d5144fa",
        "rBTC_HBTC": "0x58B657521d1dDEfCEf5808F8679234FFb3294bE0",
        "rETH_HETH": "0xD040E56F834bd6B05f70bABC13316c45ADE5cDA6",
        "RICE_rUSD": "0xf45d290AE1017dbf6292A74A36Eb4E06969d77E7",
        "RICE_rBTC": "0xf051dCD8b9f188cF210D670fa3239aD3489f7057",
        "RICE_rETH": "0x0CA70eCba6452B1e2aD277df2d56DECaa3A968F1"
    },
    "public": {
        "IFAMaster": "0x8b043171Fe28B9dF45cB404B34Ed062a4EA10D62",
        "IFAPool": "0x00791b02392b57f0B3B1C66DA84A2f3261D0C1c3",
        "IFABank": "0x7CCac84c8c83c43d89Ac33e42CDF25e0abF0d821",
        "IFARevenue": "0x416Ea8C94AA1259f8A0B329b43267A13436cD468",
        "Costco": "0xCbe335C21BD13306Ec8E6c80e44dc178C42Fb9f0",
        "IFADataBoard": "0x355622db57B32e9e178596D935c8Ae75De45d38E",
        "CreateIFA": "0x0A28a69CAaeF2C6fa6FbC00B670076b97186f4C1",
        "ShareRevenue": "0xFa3E964260A888840F870DB38894671Ae0D1bDA1",
        "Parities": "0xaf9B385945E41a7ec87ac7D1a0760354Ff1474D4"
    },
    "poolVaults": {
        "BirrCastle": "0x18ac16050563a7525e8A76215B453A1AA853e379",
        "Sunnylands": "0x9B774a6bb89E1bD634b3C4c289071C3fe1318Ebf",
        "ChateauLafitte": "0xAF23C3FE1C66102Afe29Fe7969B4d9c22675A43E",
        "AdareManor": "0xBfFBa95565E9AdF0917F5905B5269EbFe2A4B3d0",
        "VillaDEste": "0x3F37D5A3cF2Aa490Aba8A9E031a40054d7BF71b3",
        "VillaLant": "0x32F71c8291E72c58951e9eb2872CDB0D596621Fa",
        "VillaFarnese": "0xfaDa174Bd58Ef5C8845a97F5C77778A04A9545b8",
        "ChatsworthHouse": "0x191Eb54BFDb461773B6C346c84f557B7953b6b60",
        "ChateauMargaux": "0xA491D30B02f79d6A6612Ac695784f4bBe6b94086"
    },
    "calculatorsAddress": {
        "BirrCastleCalculators": "0xDe22bAA6489c59B29311083e005A9808Acaa7934",
        "SunnylandsCalculators": "0xB65132DA4BEC5C993442bd4ea9056c5bb1F8a458",
        "ChateauLafitteCalculators": "0x3086F51dbA5f37b1fcbf3c76b69a1291D997A56b"
    }
}

contract('pool rate test cases', ([alice, bob]) => {
    before(async () => {

    });

    it('', async () => {

    });
});