const Web3 = require('web3');
const Web3Utils = require('web3-utils');
const bigInt = require("big-integer");
const axios = require('axios');
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/06718ec16aa74776a79c531df064a7c8'))
const pairAbi = require('./UniswapV2Pair.json');
const ethUsdtPairAddress = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; //token0: Eth (18 decimals), token1: USDT (6 decimals)
const wbtcEthPairAddress = "0xbb2b8038a1640196fbe3e38816f3e67cba72d940"; //token0: WBTC (8 dec), token1 ETH (18 dec)
let ethUsdtInstance = new web3.eth.Contract(pairAbi.abi, ethUsdtPairAddress)
let wbtcEthInstance = new web3.eth.Contract(pairAbi.abi, wbtcEthPairAddress)
const converters = require("./converters")

let swaps = {
    "ETHUSDT": {},
    "WBTCETH": {}
}

let latestBlockTimestamp = '0';

const invokeSwapListener = async function() {
    let latestBlockNumber = 11639446;
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
    wbtcEthInstance.events.Swap(
        {
            fromBlock: latestBlockNumber
        },
        async (error, event) => {
            if (error) {
                console.error(error.msg);
                throw error;
            }
            const caughtEvent = event.event;
            // console.log(event)
            addSwap(event, "WBTCETH")
            latestBlockNumber = event.blockNumber;
        }
    )
}

const addSwap = function(event, pair){
    let converter0;
    let converter1;
    if(pair === "ETHUSDT") { // since erc-20 token have different decimal places, we need custom converter logic for each pair
        converter0 = (num) => Number(converters.weiToEth(num));
        converter1 = (num) => Number(converters.szaboToEth(num));
    } else if( pair === "WBTCETH") {
        converter0 = (num) => Number(converters.gweiToEth(num) * 10);
        converter1 = (num) => Number(converters.weiToEth(num));
    }

    if(event.returnValues.amount0In === '0'){ //buying eth
        const selling = converter1(event.returnValues.amount1In)
        const buying = converter0(event.returnValues.amount0Out)
        const price0 = selling / buying;
        const price1 = buying / selling;
        derivePrice({block: event.blockNumber, price0, price1}, pair)
    } else { //selling eth
        const selling = converter0(event.returnValues.amount0In)
        const buying = converter1(event.returnValues.amount1Out)
        const price0 = buying / selling;
        const price1 = selling / buying;
        derivePrice({block: event.blockNumber, price0, price1}, pair)
    }
}



const derivePrice = function(swap, pair) {
    if(swaps[pair][swap.block]){
        const currElem = swaps[pair][swap.block]
        const newPrice0 = calcNewAverage(currElem.swapCount, currElem.derivedPrice0, swap.price0)
        const newPrice1 = calcNewAverage(currElem.swapCount, currElem.derivedPrice1, swap.price1)
        swaps[pair][swap.block] = {swapCount: currElem.swapCount + 1, derivedPrice0: newPrice0, derivedPrice1: newPrice1}
    } else {
        swaps[pair][swap.block] = {derivedPrice0: swap.price0, derivedPrice1: swap.price1, swapCount: 1}
    }
    console.log(pair, swaps[pair])
}

const calcNewAverage = function(count, currentAverage, incomingPrice) { // calculates a new average 
    return currentAverage + ((incomingPrice - currentAverage) / (count + 1))
}



invokeSwapListener()


// const getDerivedPrice = async function() {
//     const accounts = await web3.eth.getAccounts();
//     ethUsdtInstance.methods.price1CumulativeLast().call({from: accounts[0]}, 11620993)
//         .then(res => {
//             console.log("here")
//             console.log(res)
//             return res
//         })
//         .catch(err => console.log)
// }

// const decypherDerivedPrice = async function(res, blockNumber) {
//     if(latestBlockTimestamp === '0'){ // need to query previous timestamp
//         latestBlockTimestamp = getBlockTimestamp(blockNumber - 1)
//     }
//     const currentBlockTimestamp = getBlockTimestamp(blockNumber)
//     const timeElapsed = currentBlockTimestamp - latestBlockTimestamp;
    
// }

// const getBlockTimestamp = async function(blockNumber) {
//     axios.get("https://api.etherscan.io/api?module=block&action=getblockreward&blockno=" + blockNumber + "&apikey=AJCTSFYEGJWIWBENRU1PDMWI1HK3QF4VKY") // bad bad bad pauulll
//         .then(response => {
//             console.log(response.data.result.timestamp)
//             return response.data.result.timestamp
//         })
//         .catch(error => {
//             console.log(error);
//         });
// }

// getBlockTimestamp(111111)

// getDerivedPrice()
