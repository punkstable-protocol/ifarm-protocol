// ============ Contracts ============
// Content:
// 1. IFAGovernorAlpha
// 2. IFATimelock

// Token
// deployed first
const IFA = artifacts.require("IFAToken");

// IFAGovernance
// deployed second
const IFAGov = artifacts.require("GovernorAlpha");
const IFATimelock = artifacts.require("Timelock");


// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
    await Promise.all([
        deployIFAGovernance(deployer, network, accounts),
    ]);
};

module.exports = migration;

// ============ Deploy Functions ============
// This is split across multiple files so that
// if the web3 provider craps out, all progress isn't lost.
//
// This is at the expense of having to do 6 extra txs to sync the migrations
// contract

async function deployIFAGovernance(deployer, network, accounts) {
    await deployer.deploy(IFA);
    await deployer.deploy(IFATimelock, accounts[0], 86400);

    await deployer.deploy(IFAGov,
        IFATimelock.address,
        IFA.address,
        accounts[0]
    );
}
