const Web3 = require('web3');
const Web3Utils = require('web3-utils');
const bigInt = require("big-integer");
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/06718ec16aa74776a79c531df064a7c8'))
const pairAbi = require('./UniswapV2Pair.json');
const ethUsdtPairAddress = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; //token0: Eth (18 decimals), token1: USDT (6 decimals)
let ethUsdtInstance = new web3.eth.Contract(pairAbi.abi, ethUsdtPairAddress)
const converters = require("./converters")

let swaps = {
    "ETHUSDT": []
}

const invokeSwapListener = async function() {
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
            addSwap(event, "ETHUSDT")
            latestBlockNumber = event.blockNumber;
        }
    )
}

const addSwap = function(event, pair){
    console.log(event)
    if(event.returnValues.amount0In === '0'){ //buying eth
        const selling = Number(converters.szaboToEth(event.returnValues.amount1In))
        const buying = Number(converters.weiToEth(event.returnValues.amount0Out))
        const derivedPrice = selling / buying;
        console.log("Selling " + selling + " USDT")
        console.log("For " + buying + " Eth")
        console.log("Price: " + derivedPrice + " USDT")
        console.log("________________________________")
        console.log()
        swaps[pair].push({amountEth: buying, amountUSDT: selling, block: event.blockNumber, derivedPrice})
    } else { //selling eth
        const selling = Number(converters.weiToEth(event.returnValues.amount0In))
        const buying = Number(converters.szaboToEth(event.returnValues.amount1Out))
        const derivedPrice = buying / selling;
        console.log("Selling " + selling + " Eth")
        console.log("For " + buying + " USDT")
        console.log("Price: " + derivedPrice + " USDT")
        console.log("________________________________")
        console.log()
        swaps[pair].push({amountEth: selling, amountUSDT: buying, block: event.blockNumber, derivedPrice})
    }
    console.log(swaps)
}

invokeSwapListener()

