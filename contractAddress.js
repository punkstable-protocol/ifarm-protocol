
// Contract address
const ChainNet = {
    MainNet: "mainnet",
    TestNet: "testnet"
}

const ChainName = {
    LOCAL: 'local',
    HECO: "heco",
    BNB: "bnb"
}

current_net = ChainNet.MainNet
current_chain = ChainName.HECO


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
        'rETH': "0x92cC6eedc75EF1041491943BE30a0D6503151628",
        'rBTC': "0x06F9e1457904424A9561F7F570D5f727FCB44Ce0",
        'rUSD': "0x607281f5a2173B63fAd64995Da4BC8718424a275",
    },
    'tokens': {
        // HUSD address -> USDT address
        'HUSD': '0xa71EdC38d189767582C38A3145b5873052c3e47a',
        'HBTC': '0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa',
        'HETH': '0x64FF637fB478863B7468bc97D30a5bF3A428a1fD',
        'WHT': '0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F',
        'RICE': '0x6Fd5aDc57c76610315F59bE816eae39b1e3B0917',
        'USDT': '0xa71EdC38d189767582C38A3145b5873052c3e47a'
    },
    'lpToken': {
        // HUSD address -> USDT address
        // "rUSD_HUSD": '0xa6a72e904B67dF314Dd08b17D94D9c36cF0F8eFA',
        "rUSD_USDT": '0xb3bc21630e96a96acafefb63c4d55313c2a1f8d6',
        "rBTC_HBTC": '0x439bcb8548ba4d17e1b095828d68b77d50f4e81a',
        "rETH_HETH": '0xb86a12244b27883075d77b2a02cc3ee9cacce4c3',
        'RICE_rUSD': '0xd0da8992bfaa58a0345e6e122f85c6867b069b3c',
        'RICE_rBTC': '0xa24038abd64c5cf841052ec81e413fbf05e639d2',
        'RICE_rETH': '0x4cd6848ecb27076ddaaba8b517c6a76135674921',
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
        'rETH': "0x8c5677b4FEaff533daB4638D7BEd7FFc972c4E84",
        'rBTC': "0x7d1E2717322a9155242A1853a28A0148a10Efb61",
        'rUSD': "0x4d97D3bf4A0bD87F9DEBb16873BdfE24127C9307",
    },
    'tokens': {
        'HUSD': '0x55d398326f99059ff775485246999027b3197955',
        'HBTC': '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        'HETH': '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        'WHT': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        'RICE': '0xAe479E294C6De21842A4dbdf6785D1eACb0a23aE',
        'USDT': '0x55d398326f99059ff775485246999027b3197955'
    },
    'lpToken': {
        "rUSD_USDT": '0x8194131062728c47786504121006e89683612f95',
        "rBTC_HBTC": '0x3065e2bc37455f87c966bd5dd6ce36d741f4d260',
        "rETH_HETH": '0xcb52873dd94220b60b7c3bb8c61dbea658185e6a',
        "RICE_rUSD": '0x90929072a77fc2002e14aea58c1b84bb2146fafb',
        "RICE_rBTC": '0xddbb73f596e0abae761df2b05051956388abb6ea',
        "RICE_rETH": '0x1746297dbb24effb7485a248398b6f558a675771'
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
    }
}


let getDeployedContract = () => {
    return net_items[current_chain][current_net]
}

module.exports = {
    'getDeployedContract': getDeployedContract
}