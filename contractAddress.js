
// Contract address
const ChainNet = {
    MainNet: "mainnet",
    TestNet: "testnet"
}

const ChainName = {
    LOCAL: 'local',
    HECO: "heco",
    BNB: "bnb",
    RINKEBY: "rinkeby",
    REMOTE: "remote"
}

current_net = ChainNet.MainNet
current_chain = ChainName.RINKEBY

const rinkebyNetContract = {
    'mdex': {
        'factory': "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        'router': "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    },
    'itokens': {
        'rETH': "0x80F6979bc7Eb1FCD72967b78e4C783789aC4f108",
        'rBTC': "0x5199Fc35A231490CFabDcD45F34d16fA8E879051",
        'rUSD': "0x3DA9361E5AA1Df3748689a2Dec32A6A8cdb48fb0",
    },
    'tokens': {
        'HUSD': '0x387d9d7901EDcAc1E431e5cDC8E860a9F22960b6',
        'HBTC': '0xef6c4D1B51DDdA3e57A0d609BFD8056F594E08F0',
        'HETH': '0x250504A933DA341F6d65Eb64E3a4a269370208A6',
        'WHT': '',
        'RICE': '0x60Bfa41Fa438c96efB0Df5904f6e23288cB86910',
        'USDT': '0x387d9d7901EDcAc1E431e5cDC8E860a9F22960b6'
    },
    'lpToken': {
        "rUSD_USDT": '0x197ad94fe35df4ee20016ef0b549597e9629d95f',
        "rBTC_HBTC": '0xd8bd05cf719230ef13a4f397a734defbc86233fd',
        "rETH_HETH": '0x9d8e70e53bbb545d1ed3b84d8bdd634f8b1c4f7b',
        "RICE_rUSD": '0xbb29c6735f24ccfe17f3411c978b76c91438a14d',
        "RICE_rBTC": '0x5f621bd9ba8b19882f52c06bdab55f48469d5a79',
        "RICE_rETH": '0xde919ac7d48cd47c0be28ded0749e411f3a46ab0'
    }
}

// local chain develop address
const remoteTestNetContract = {
    'mdex': {
        'factory': "0x223a74cab41a9AE8ca339c7F0c1a99E6AF7D8d6C",
        'router': "0x61b305165D158bee6e78805530DaDcBf42B858B9",
    },
    'itokens': {
        'rETH': "0xac1F7D00cC80359b62D8C86e01f30Af0a50827D3",
        'rBTC': "0x582595CAFfB71866318482362e11622318e06825",
        'rUSD': "0x635e883095F4819bDE6b26Ce080EcbD78b704319",
    },
    'tokens': {
        'HUSD': '',
        'HBTC': '',
        'HETH': '',
        'WHT': '',
        'RICE': '',
        'USDT': ''
    },
    'lpToken': {
        "rUSD_USDT": '',
        "rBTC_HBTC": '',
        "rETH_HETH": '',
        "RICE_rUSD": '',
        "RICE_rBTC": '',
        "RICE_rETH": ''
    }
}


// local chain develop address
const localNetContract = {
    'mdex': {
        'factory': "0x223a74cab41a9AE8ca339c7F0c1a99E6AF7D8d6C",
        'router': "0x61b305165D158bee6e78805530DaDcBf42B858B9",
    },
    'itokens': {
        'rETH': "0xac1F7D00cC80359b62D8C86e01f30Af0a50827D3",
        'rBTC': "0x582595CAFfB71866318482362e11622318e06825",
        'rUSD': "0x635e883095F4819bDE6b26Ce080EcbD78b704319",
    },
    'tokens': {
        'HUSD': '',
        'HBTC': '',
        'HETH': '',
        'WHT': '',
        'RICE': '',
        'USDT': ''
    },
    'lpToken': {
        "rUSD_USDT": '',
        "rBTC_HBTC": '',
        "rETH_HETH": '',
        "RICE_rUSD": '',
        "RICE_rBTC": '',
        "RICE_rETH": ''
    }
}


// heco chain develop address
const hecoTestNetContract = {
    'mdex': {
        'factory': "0x223a74cab41a9AE8ca339c7F0c1a99E6AF7D8d6C",
        'router': "0x61b305165D158bee6e78805530DaDcBf42B858B9",
    },
    'itokens': {
        'rETH': "0x8c5677b4FEaff533daB4638D7BEd7FFc972c4E84",
        'rBTC': "0x7d1E2717322a9155242A1853a28A0148a10Efb61",
        'rUSD': "0x4d97D3bf4A0bD87F9DEBb16873BdfE24127C9307",
    },
    'tokens': {
        'HUSD': '0x8Dd66eefEF4B503EB556b1f50880Cc04416B916B',
        'HBTC': '0x1D8684e6CdD65383AfFd3D5CF8263fCdA5001F13',
        'HETH': '0xfeB76Ae65c11B363Bd452afb4A7eC59925848656',
        'WHT': '0x9C6eb346f2105673eefaF2E8d0d6AFBf23b27005',
        'RICE': '0x58eABbc7438bd1e025868bD75d55aDEe1c1A1995',
        'USDT': '0x04F535663110A392A6504839BEeD34E019FdB4E0'
    },
    'lpToken': {
        "rUSD_USDT": '0xEAB31C7dBd11c28E2D777075640a73e5E7d7FdD6',
        "rBTC_HBTC": '0xb4dE9b60E6Aec01c4CfBBD8E2e7DfE6de2A7B504',
        "rETH_HETH": '0x1f8E6639b3B77C6aaAe8169F80EAfe2146658F79',
        "RICE_rUSD": '0xA96fA13F2d1DD264993682967c11e1698481BD77',
        "RICE_rBTC": '0xbDF76FBdb106158Dc16B786d77684746C2666858',
        "RICE_rETH": '0xCaC2EEDE0C4A31ABa9707daCBDc2fBff310e4348'
    }
}

// heco chain ropsten address
const hecoMainNetContract = {
    'mdex': {
        'factory': "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
        'router': "0xED7d5F38C79115ca12fe6C0041abb22F0A06C300",
    },
    'itokens': {
        'rETH': "0x34bc744cD1eF3f28d0c4AA5cF9D2B14E35Fe5F61",
        'rBTC': "0x9f16A5Dbc5E9b317C89524B9eA7fFC34a267999A",
        'rUSD': "0xe20a212bF2A17335F8Ab10AAdF2E8E8aa769AE27",
    },
    'tokens': {
        // HUSD address -> USDT address
        'HUSD': '0xa71EdC38d189767582C38A3145b5873052c3e47a',
        'HBTC': '0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa',
        'HETH': '0x64FF637fB478863B7468bc97D30a5bF3A428a1fD',
        'WHT': '0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F',
        'RICE': '0x59B110f314F33C4F48084cEdD422E40fa4a8c7ed',
        'USDT': '0xa71EdC38d189767582C38A3145b5873052c3e47a'
    },
    'lpToken': {
        // HUSD address -> USDT address
        "rUSD_USDT": '0x2512377a534463cc064049ccfadf2fdf58b48dbf',
        "rBTC_HBTC": '0x40b69fec1856e135a785c9f51ceab743f5e26c9f',
        "rETH_HETH": '0xfb930ecf56a97648388ec87df2552cc2b1952319',
        'RICE_rUSD': '0x8f0b9b4adc7f45110cf5552a18be37a2464c0ce8',
        'RICE_rBTC': '0x79f873ad90e36b2abd51ecf5515c40e7a9b34a95',
        'RICE_rETH': '0x62004760e3c846cef95f66d5db6eb185b62305c4',
    }
}


// bnb chain develop address
const bnbTestNetContract = {
    'mdex': {
        'factory': "0x223a74cab41a9AE8ca339c7F0c1a99E6AF7D8d6C",
        'router': "0x61b305165D158bee6e78805530DaDcBf42B858B9",
    },
    'itokens': {
        'rETH': "0xFE3D27dc3b387D0F340338bE23261a13c4a6cfC6",
        'rBTC': "0x5388eBC0F6990c4B1902Faf4Adf60981dC6b58Bd",
        'rUSD': "0xC49CeC5672b9343109B8E816187915e622bC3aA5",
    },
    'tokens': {
        'HUSD': '0x91cc1f86Ea68c733315e2303ABD224bcCE11E9c5',
        'HBTC': '0x4df70F06F374cE784e1fa74ab19c11Eceff0A9Ee',
        'HETH': '0xa0DAecE1546F245F5d651B8340Dda6ADa1e9971b',
        'WHT': '0x2b8ff854c5e16cf35b9a792390cc3a2a60ec9ba2',
        'RICE': '0x1cE2546357647B5c07477C7a9fe1C914826d0F01',
        'USDT': '0xAB66426C977c16cC2F0C4Ef619783075016220C5'
    },
    'lpToken': {
        "rUSD_USDT": '',
        "rBTC_HBTC": '',
        "rETH_HETH": '',
        "RICE_rUSD": '',
        "RICE_rBTC": '',
        "RICE_rETH": ''
    }
}

// bnb chain mainnet address
const bnbMainNetContract = {
    'mdex': {
        'factory': "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
        'router': "0x05ff2b0db69458a0750badebc4f9e13add608c7f",
    },
    'itokens': {
        'rETH': "0x5f7c33Ef5Bd357F73Ca8D090fd124dF7c2c8B372",
        'rBTC': "0xA4b9BA0A8CD1A183fd9B0A235D719286AdDC2bcb",
        'rUSD': "0x4779DAEa8E7259514aBAEa2918B767B0B576FBC1",
    },
    'tokens': {
        'HUSD': '0x55d398326f99059ff775485246999027b3197955',
        'HBTC': '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        'HETH': '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        'WHT': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        'RICE': '0xa13283562827D0Dff6D6811464D927edE029Ff46',
        'USDT': '0x55d398326f99059ff775485246999027b3197955'
    },
    'lpToken': {
        "rUSD_USDT": '0x12c0e8b32f43df781fbfd26d38b7ee6cf4b6b62f',
        "rBTC_HBTC": '',
        "rETH_HETH": '0xdfef40c39e0064e137675dff535d1f3d00571eb7',
        "RICE_rUSD": '0x08ac513df9ad4f1b40bd860d31ff7a3d1b594b60',
        "RICE_rBTC": '',
        "RICE_rETH": '0xa69878b4beff03de6860ad54960ac916e3b44f7b'
    }
}

let net_items = {
    'local': {
        'testnet': localNetContract,
        'mainnet': localNetContract
    },
    'heco': {
        'testnet': hecoTestNetContract,
        'mainnet': hecoMainNetContract
    },
    'bnb': {
        'testnet': bnbTestNetContract,
        'mainnet': bnbMainNetContract
    },
    'remote': {
        'testnet': remoteTestNetContract,
        'mainnet': remoteTestNetContract
    },
    'rinkeby': {
        'testnet': rinkebyNetContract,
        'mainnet': rinkebyNetContract
    }
}


let getDeployedContract = () => {
    return net_items[current_chain][current_net]
}

module.exports = {
    'getDeployedContract': getDeployedContract
}