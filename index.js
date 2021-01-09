const Web3 = require('web3');
const Web3Utils = require('web3-utils');
const bigInt = require("big-integer");
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/06718ec16aa74776a79c531df064a7c8'))
const pairAbi = require('./UniswapV2Pair.json');
const ethUsdtPairAddress = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; //token0: Eth (18 decimals), token1: USDT (6 decimals)
let ethUsdtInstance = new web3.eth.Contract(pairAbi.abi, ethUsdtPairAddress)
const converters = require("./converters")

let trades = {}


const invokeListener = async function() {
    let latestBlockNumber = 11620993;
    ethUsdtInstance.events.Swap(
        {
            fromBlock: latestBlockNumber
        },
        async (error, event) => {
            if (error) {
                console.error(error.msg);
                throw error;
            }
            const caughtEvent = event.event;
            addTrade(event)
            latestBlockNumber = event.blockNumber;
        }
    )
}

const addTrade = function(event){
    if(event.returnValues.amount0In === '0'){ //buying eth
        let selling = Number(converters.szaboToEth(event.returnValues.amount1In))
        let buying = Number(converters.weiToEth(event.returnValues.amount0Out))
        console.log("Selling " + selling + " USDT")
        console.log("For " + buying + " Eth")
        console.log("Price: " + (selling / buying) + " USDT")
        console.log("________________________________")
        console.log()
    } else { //selling eth
        let selling = Number(converters.weiToEth(event.returnValues.amount0In))
        let buying = Number(converters.szaboToEth(event.returnValues.amount1Out))
        console.log("Selling " + selling + " Eth")
        console.log("For " + buying + " USDT")
        console.log("Price: " + (buying / selling) + " USDT")
        console.log("________________________________")
        console.log()
    }

}

invokeListener()

