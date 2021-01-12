const Web3Utils = require('web3-utils');


const gweiToEth = (num) => {
    if(num instanceof String){
        return Web3Utils.fromWei(Web3Utils.toWei(num, "gwei"), "ether")
    }
    return Web3Utils.fromWei(Web3Utils.toWei(num.toString(), "gwei"), "ether")
}

const mweiToEth = (num) => {x
    if(num instanceof String){
        return Web3Utils.fromWei(Web3Utils.toWei(num, "mwei"), "ether")
    }
    return Web3Utils.fromWei(Web3Utils.toWei(num.toString(), "mwei"), "ether")
}

const szaboToEth = (num) => {
    if(num instanceof String){
        return Web3Utils.fromWei(Web3Utils.toWei(num, "szabo"), "ether")
    }
    return Web3Utils.fromWei(Web3Utils.toWei(num.toString(), "szabo"), "ether")
}

const weiToEth = (num) => {
    if(num instanceof String){
        return Web3Utils.fromWei(num, "ether")
    }
    return Web3Utils.fromWei(num.toString(), "ether")
}

exports.gweiToEth = gweiToEth;
exports.mweiToEth = mweiToEth;
exports.weiToEth = weiToEth;
exports.szaboToEth = szaboToEth;