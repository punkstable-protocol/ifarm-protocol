
// Contract address
current_net = 'ropsten'

// develop address
const allDevelopContract = {
    'uniswapsAddress': {
        'uniswapV2Factory': "0xBBa9c67e95e3D997a8Af1D1AB0A0b5076A60BAB2",
        'uniswapV2Router': "0xDbA9FC3A3f07a2b9d085C78CE488b9D145430ECc",
    },
    'itokensAddress': {
        'iETH': "0xc257BCf9EEEbC727C14BA4451298ec70534540eC",
        'iBTC': "0x3362599C498AaE2087ace38CEff19FcE08FfD0ae",
        'iUSD': "0xB178B47afbc33BDd036D178E4F48d3086e3beFF5",
    },
    'tokensAddress': {
        'DAI': '0xe5737F0f694897331FE28640D2164B1404F23Dc0',
        'wBTC': '0xe65b25FE4bec1F5aC9364304a175d68b582f5d0a',
        'wETH': '0x9004529746a3d2496E46248929a3a57Cd30B0d0f',
        'IFA': '0x567E6A969170217862632cFE93b6e36B9565e262',
        'USD': '0x7F4939cFE161A7159B5e156b99B6fbE0694c239c',
    },
    'lpTokenAddress': {
        "iUSD_DAI": "0xF8C8106FCcb36a2158b03D5F3608FDc46914E984",
        "iBTC_wBTC": "0x5F7Cf94076517478e5103aC59dB14CfaFD52D811",
        "iETH_ETH": "0x6570b812649a422C1ab09CdE590328d0E40d4D20",
        "IFA_DAI": "0xaAC6eC6F6d363F179f29b00c050Cc956E1f87eaa",
        "IFA_wBTC": "0x6499F9C7893906B219A731abB03c0f6D93aCf6c8",
        "IFA_ETH": "0xbB0316F0eD3d9f332A929648a035Db899C787384",
    }
}

// ropsten address
const allRopstenContract = {
    'uniswapsAddress': {
        'uniswapV2Factory': "0xBBa9c67e95e3D997a8Af1D1AB0A0b5076A60BAB2",
        'uniswapV2Router': "0xDbA9FC3A3f07a2b9d085C78CE488b9D145430ECc",
    },
    'itokensAddress': {
        'iETH': "0xc257BCf9EEEbC727C14BA4451298ec70534540eC",
        'iBTC': "0x3362599C498AaE2087ace38CEff19FcE08FfD0ae",
        'iUSD': "0xB178B47afbc33BDd036D178E4F48d3086e3beFF5",
    },
    'tokensAddress': {
        'DAI': '0xe5737F0f694897331FE28640D2164B1404F23Dc0',
        'wBTC': '0xe65b25FE4bec1F5aC9364304a175d68b582f5d0a',
        'wETH': '0x9004529746a3d2496E46248929a3a57Cd30B0d0f',
        'IFA': '0x567E6A969170217862632cFE93b6e36B9565e262',
        'USD': '0x7F4939cFE161A7159B5e156b99B6fbE0694c239c',
    },
    'lpTokenAddress': {
        "iUSD_DAI": "0xF8C8106FCcb36a2158b03D5F3608FDc46914E984",
        "iBTC_wBTC": "0x5F7Cf94076517478e5103aC59dB14CfaFD52D811",
        "iETH_ETH": "0x6570b812649a422C1ab09CdE590328d0E40d4D20",
        "IFA_DAI": "0xaAC6eC6F6d363F179f29b00c050Cc956E1f87eaa",
        "IFA_wBTC": "0x6499F9C7893906B219A731abB03c0f6D93aCf6c8",
        "IFA_ETH": "0xbB0316F0eD3d9f332A929648a035Db899C787384",
    }
}

// local address
const allLocalContract = {
    'uniswapsAddress': {
        'uniswapV2Factory': "0xBBa9c67e95e3D997a8Af1D1AB0A0b5076A60BAB2",
        'uniswapV2Router': "0xDbA9FC3A3f07a2b9d085C78CE488b9D145430ECc",
    },
    'itokensAddress': {
        'iETH': "0xc257BCf9EEEbC727C14BA4451298ec70534540eC",
        'iBTC': "0x3362599C498AaE2087ace38CEff19FcE08FfD0ae",
        'iUSD': "0xB178B47afbc33BDd036D178E4F48d3086e3beFF5",
    },
    'tokensAddress': {
        'DAI': '0xe5737F0f694897331FE28640D2164B1404F23Dc0',
        'wBTC': '0xe65b25FE4bec1F5aC9364304a175d68b582f5d0a',
        'wETH': '0x9004529746a3d2496E46248929a3a57Cd30B0d0f',
        'IFA': '0x567E6A969170217862632cFE93b6e36B9565e262',
        'USD': '0x7F4939cFE161A7159B5e156b99B6fbE0694c239c',
    },
    'lpTokenAddress': {
        "iUSD_DAI": "0xF8C8106FCcb36a2158b03D5F3608FDc46914E984",
        "iBTC_wBTC": "0x5F7Cf94076517478e5103aC59dB14CfaFD52D811",
        "iETH_ETH": "0x6570b812649a422C1ab09CdE590328d0E40d4D20",
        "IFA_DAI": "0xaAC6eC6F6d363F179f29b00c050Cc956E1f87eaa",
        "IFA_wBTC": "0x6499F9C7893906B219A731abB03c0f6D93aCf6c8",
        "IFA_ETH": "0xbB0316F0eD3d9f332A929648a035Db899C787384",
    }
}

let net_items = {
    'develop': allDevelopContract,
    'ropsten': allRopstenContract,
    'local': allLocalContract,
}

let getDeployedContract = () => {
    return net_items[current_net]
}

module.exports = {
    'getDeployedContract': getDeployedContract
}