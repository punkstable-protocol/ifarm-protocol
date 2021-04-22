const { ether } = require('@openzeppelin/test-helpers')
const MockERC20 = artifacts.require('MockERC20')

const migration = async (deployer, network, accounts) => {
    if (network.indexOf('fork') != -1) {
        return
    }
    await Promise.all([
        mockERC20(deployer)
    ])
};

const mockERC20 = async (deployer) => {
    let name = "DODO bird"
    let symbol = "DODO"
    let supply = ether('8000000')
    deployer.deploy(MockERC20,
        name,
        symbol,
        supply
    )
}

module.exports = migration