// ============ Contracts ============
// Content:
// 1. IFA Token

// Token
// deployed first

const IFA = artifacts.require("IFAToken");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
    await Promise.all([
        deployToken(deployer, network),
    ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
    await deployer.deploy(IFA);
    //console.log(IFA);
}