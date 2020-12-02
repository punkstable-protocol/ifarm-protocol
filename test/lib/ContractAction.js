const UniswapV2Router02 = require("../contractsJson/UniswapV2Router02.json");
const UniswapV2Factory = require("../contractsJson/UniswapV2Factory.json");
const iTokenDelegator = require("../contractsJson/iTokenDelegator.json");
const Rebaser = require("../contractsJson/iTokenRebaser.json")
const wETH = require("../contractsJson/wETH.json");
const IFA = require("../../build/contracts/IFAToken.json");

class ContractAt {
    constructor() {
        this.at = (_abi, _address) => {
            return new web3.eth.Contract(_abi, _address);
        }
    }
    iToken(_contractAddress) {
        return this.at(iTokenDelegator.abi, _contractAddress);
    }
    uniswapV2Factory(_contractAddress) {
        return this.at(UniswapV2Factory.abi, _contractAddress);
    }
    uniswapV2Router02(_contractAddress) {
        return this.at(UniswapV2Router02.abi, _contractAddress);
    }
    wETH(_contractAddress) {
        return this.at(wETH.abi, _contractAddress);
    }
    IFA(_contractAddress) {
        return this.at(IFA.abi, _contractAddress);
    }
    Rebaser(_contractAddress){
        return this.at(Rebaser.abi, _contractAddress);
    }
}

class Contract {
    constructor() {
        this.contract = async (_deployAccount, _abi, _bytecode, _arguments) => {
            let newContract = new web3.eth.Contract(_abi);
            let Gas = await newContract.deploy({ data: _bytecode.object, arguments: _arguments }).estimateGas((err, gas) => { return gas });
            return newContract.deploy({ data: _bytecode.object, arguments: _arguments })
                .send({ from: _deployAccount, gas: Gas });
        }
    }

    UniswapV2Router02(_deployAccount, _arguments) {
        return this.contract(_deployAccount, UniswapV2Router02.abi, UniswapV2Router02.bytecode, _arguments);
    }

    UniswapV2Factory(_deployAccount, _arguments) {
        return this.contract(_deployAccount, UniswapV2Factory.abi, UniswapV2Factory.bytecode, _arguments);
    }
}

module.exports = {
    newContractAt: new ContractAt(),
    newContract: new Contract()
}
