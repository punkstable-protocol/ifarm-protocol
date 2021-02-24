
// Contract address
current_net = 'test'
// current_net = 'mainnet'

// develop address
const testNetContract = {
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
        "rUSD_HUSD": '',
        "rBTC_HBTC": '',
        "rETH_HETH": '',
        "RICE_HUSD": '',
        "RICE_HBTC": '',
        "RICE_HETH": ''
    }
}

// ropsten address
const mainNetContract = {
    'mdex': {
        'factory': "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
        'router': "0xED7d5F38C79115ca12fe6C0041abb22F0A06C300",
    },
    'itokens': {
        'rETH': "0x8c5677b4FEaff533daB4638D7BEd7FFc972c4E84",
        'rBTC': "0x7d1E2717322a9155242A1853a28A0148a10Efb61",
        'rUSD': "0x4d97D3bf4A0bD87F9DEBb16873BdfE24127C9307",
    },
    'tokens': {
        'HUSD': '0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047',
        'HBTC': '0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa',
        'HETH': '0x64FF637fB478863B7468bc97D30a5bF3A428a1fD',
        'WHT': '0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F',
        'IFA': '',
        'USDT': '0xa71EdC38d189767582C38A3145b5873052c3e47a'
    },
    'lpToken': {
        "rUSD_HUSD": '0xa6a72e904B67dF314Dd08b17D94D9c36cF0F8eFA',
        "rBTC_HBTC": '0x78fab4c35b1c0d073a983a72d00c39f7182a69e1',
        "rETH_HETH": '0x13e4d5f5567a6d4e29fa9b72d554d37e116ca54a',
        "RICE_HUSD": '',
        "RICE_HBTC": '',
        "RICE_HETH": ''
    }
}

let net_items = {
    'test': testNetContract,
    'mainnet': mainNetContract,
}

let getDeployedContract = () => {
    return net_items[current_net]
}

module.exports = {
    'getDeployedContract': getDeployedContract
}