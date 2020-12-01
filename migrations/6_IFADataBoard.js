// ============ Contracts ============
const ifaMaster = '0xf03a26206DB65f8DB8a52522d3368D08C5DECBf6';
const IFADataBoard = artifacts.require("IFADataBoard");

// ============ Main Migration ============
const migration = async (deployer, network) => {
    await Promise.all([
        deployIFADataBoard(deployer, network),
    ]);
};

module.exports = migration;


// ============ Deploy Functions ============
async function deployIFADataBoard(deployer, network) {
    await deployer.deploy(IFADataBoard, ifaMaster);
}