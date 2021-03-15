
// Contract address
const ChainNet = {
    MainNet: "mainnet",
    TestNet: "testnet"
}

const ChainName = {
    LOCAL: 'local',
    HECO: "heco",
    BNB: "bnb",
    REMOTE: "remote"
}

current_net = ChainNet.MainNet
current_chain = ChainName.REMOTE

// local chain develop address
const remoteTestNetContract = {
    'mdex': {
        'factory': "0x2523f8ee80c46FD32Abf24ba6F7f131596A29055",
        'router': "0xe62bE815EE506BAb62240e71798d9BA43E30E11E",
    },
    'itokens': {
        'rETH': "0x8C54FCeEf79B1eC400C4f504B725369D4E61e38e",
        'rBTC': "0xd129D9913EE0Df91E84c9FD4Dcf289F9b528d4C4",
        'rUSD': "0x849Dcd1508893b6d28931ed870823f0783dae3EB",
    },
    'tokens': {
        'HUSD': '0x48735ee8c0E5e4e565Ea66d08AC5Cd5f6754dEe7',
        'HBTC': '0xab24d90768Cd5b841A4640498a3a632daDC47947',
        'HETH': '0x72c06f80d0d19625e483c3b2F1fF76f1cde9C6c9',
        'WHT': '',
        'RICE': '0x12e8dE0144d24f9a8D8f2B82394A90c92d123935',
        'USDT': '0x48735ee8c0E5e4e565Ea66d08AC5Cd5f6754dEe7'
    },
    'lpToken': {
        "rUSD_USDT": '0xe5e49bf82446C9879a85e0572Fb44EfEEa6d742D',
        "rBTC_HBTC": '0x547f0F278289729B45d4fEED08c23EE1a7038e0E',
        "rETH_HETH": '0x7041BA14F404b34Af389b2d51265BD6e4263cE25',
        "RICE_rUSD": '0x92262fE0D0257964836F4aC7420d53ac9eFD8F50',
        "RICE_rBTC": '0x8C301595404Cc65BF745764D91eB48552e7451cc',
        "RICE_rETH": '0x1dA66083AE34cdb21AEE906cA408165dD2Af37A7'
    }
}

// local chain develop address
const localNetContract = {
    'mdex': {
        'factory': "0x223a74cab41a9AE8ca339c7F0c1a99E6AF7D8d6C",
        'router': "0x61b305165D158bee6e78805530DaDcBf42B858B9",
    },
    'itokens': {
        'rETH': "0xB66f9B19d0E5bB477E2e24227A4CE8416efF5c45",
        'rBTC': "0xb2Cb15fE82ffCD7f0498CcDedf77B339458947B4",
        'rUSD': "0xf88E0663C5E13ce74277d6881523E191B29bbaBA",
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
        'rETH': "0x867319D466df1316b467AE45A09C03AA3D8F880a",
        'rBTC': "0x42fe17BA17D901F2ADB18e9BE763592831EF57AC",
        'rUSD': "0x2462C38cDCf7078E1889b8eccf0188a652b0fD6a",
    },
    'tokens': {
        'HUSD': '0x91cc1f86Ea68c733315e2303ABD224bcCE11E9c5',
        'HBTC': '0x4df70F06F374cE784e1fa74ab19c11Eceff0A9Ee',
        'HETH': '0xa0DAecE1546F245F5d651B8340Dda6ADa1e9971b',
        'WHT': '0x2b8ff854c5e16cf35b9a792390cc3a2a60ec9ba2',
        'RICE': '0xde3966c63B259c01fC07C5e09EE9654d34f9920f',
        'USDT': '0xAB66426C977c16cC2F0C4Ef619783075016220C5'
    },
    'lpToken': {
        "rUSD_USDT": '0x54D6e7dC82AEf5F260647b31FBf454d371fE4fC3',
        "rBTC_HBTC": '0x3f43B4E6Ad0D5b8157E93c7d482CbB86214680F6',
        "rETH_HETH": '0x8D5fd8160234d1f2B0A49912D22719C01fa8b8d1',
        "RICE_rUSD": '0x1b8B71a4Da291AAF56D2c50055AE262D46070906',
        "RICE_rBTC": '0xa934e058b6903f144dE7F239E2f3d610ca7bbeC9',
        "RICE_rETH": '0xeC0E128a00962867dEC0D450DBe0A6fa57D48693'
    }
}

// bnb chain mainnet address
const bnbMainNetContract = {
    'mdex': {
        'factory': "0xBCfCcbde45cE874adCB698cC183deBcF17952812",
        'router': "0x05ff2b0db69458a0750badebc4f9e13add608c7f",
    },
    'itokens': {
        'rETH': "0x34bc744cD1eF3f28d0c4AA5cF9D2B14E35Fe5F61",
        'rBTC': "0x9f16A5Dbc5E9b317C89524B9eA7fFC34a267999A",
        'rUSD': "0xe20a212bF2A17335F8Ab10AAdF2E8E8aa769AE27",
    },
    'tokens': {
        'HUSD': '0x55d398326f99059ff775485246999027b3197955',
        'HBTC': '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        'HETH': '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        'WHT': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        'RICE': '0x59B110f314F33C4F48084cEdD422E40fa4a8c7ed',
        'USDT': '0x55d398326f99059ff775485246999027b3197955'
    },
    'lpToken': {
        "rUSD_USDT": '0x409fb3f87aa375f64eb6404c782cee9e57023946',
        "rBTC_HBTC": '0x4ef5d08b08a31d510194ddbc6c80a7e42beef10a',
        "rETH_HETH": '0x64dbc3f5c22020f83543ce59980b45646e0d3d7c',
        "RICE_rUSD": '0xf38fb5dbd4a737d77acac9c2cc85472cea573c0a',
        "RICE_rBTC": '0xa526ca3961d3080aa41c20cbeeffa798add0ad02',
        "RICE_rETH": '0x696ea4a705ec7be875c9c41bdd7ca82afd4443fb'
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
    }
}


let getDeployedContract = () => {
    return net_items[current_chain][current_net]
}

module.exports = {
    'getDeployedContract': getDeployedContract
}