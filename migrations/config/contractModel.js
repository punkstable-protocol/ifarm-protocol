const bnbmainnet = require("./bnbmainnetContract.json")
const rinkeby = require("./rinkebyContract.json")
const development = require("./developmentContract.json")

const contractItem = {
    "bnbmainnet": bnbmainnet,
    "rinkeby": rinkeby,
    "development": development,
}

class ContractModel {
    // constructor
    constructor(_network) {
        if (_network.length == 0) {
            throw "not network null"
        }
        this._netEnv = _network
        this.contracts = ContractModel.formatAddress(_network)
    }

    static formatAddress(_network) {
        let _allContract = contractItem[_network]
        let contracts = {}
        for (let key in _allContract) {
            let kContract = _allContract[key]
            for (let k1 in kContract) {
                contracts[k1] = kContract[k1]
            }
        }
        return contracts
    }
}

module.exports = ContractModel