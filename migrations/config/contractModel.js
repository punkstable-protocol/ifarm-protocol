const bnbmainnet = require("./bnbmainnetContract.json")
const rinkeby = require("./rinkebyContract.json")

const contractItem = {
    "bnbmainnet": bnbmainnet,
    "rinkeby": rinkeby
}

class ContractModel {
    // constructor
    constructor(_network) {
        if(_network.length == 0){
            throw "not network null"
        }
        this._netEnv = _network
        this.contract = contractItem[_network]
    }
}

let c = new ContractModel("rinkeby")
console.log(c)