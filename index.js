const Web3 = require('web3');
const Web3Utils = require('web3-utils');
const bigInt = require("big-integer");
const axios = require('axios');
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/06718ec16aa74776a79c531df064a7c8', 
    {clientConfig: {
        maxReceivedFrameSize: 100000000000000,
        maxReceivedMessageSize: 1000000000000,
    }})
)
const pairAbi = require('./UniswapV2Pair.json');
const ethUsdcPairAddress = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"; //token0: USDC (6 decimals), token1: ETH (6 decimals)
const wbtcEthPairAddress = "0xbb2b8038a1640196fbe3e38816f3e67cba72d940"; //token0: WBTC (8 dec), token1 ETH (18 dec)
const wbtcUdscPairAddress = "0x004375dff511095cc5a197a54140a24efef3a416" //token0 WBTC (8 dec), token1 USDC (6 decimals)
let ethUsdcInstance = new web3.eth.Contract(pairAbi.abi, ethUsdcPairAddress)
let wbtcEthInstance = new web3.eth.Contract(pairAbi.abi, wbtcEthPairAddress)
let wbtcUsdcInstance = new web3.eth.Contract(pairAbi.abi, wbtcUdscPairAddress)
const converters = require("./converters")
const fs = require('fs')

let swaps = {
    
}


let lBlockEthUsdc = 11640000;
let lBlockWbtcEth = 11640000;
let lBlockWbtcUsdc = 11640000

const invokeSwapListener = async function() {
    wbtcEthInstance.events.Swap(
        {
            fromBlock: lBlockWbtcEth
        },
        async (error, event) => {
            if (error) {
                console.error(error.msg);
                throw error;
            }
            addSwap(event, "WBTCETH");
        }
    )
    ethUsdcInstance.events.Swap(
        {
            fromBlock: lBlockEthUsdc
        },
        async (error, event) => {
            if (error) {
                console.error(error.msg);
                throw error;
            }
           
            addSwap(event, "ETHUSDC");
        }
    )
    wbtcUsdcInstance.events.Swap(
        {
            fromBlock: lBlockWbtcEth
        },
        async (error, event) => {
            if (error) {
                console.error(error.msg);
                throw error;
            }
            addSwap(event, "WBTCUSDC");
        }
    )
}
let WBTCETHDONE = false;
let ETHUSDCDONE = false;
let WBTCUSDCDONE = false;
const addSwap = function(event, pair){
    if(pair === "WBTCETH" && event.blockNumber >= 11640709) WBTCETHDONE = true;
    if(pair === "ETHUSDC" && event.blockNumber >= 11640709) ETHUSDCDONE = true;
    if(pair === "WBTCUSDC" && event.blockNumber >= 11640709) WBTCUSDCDONE = true;
   
    if(WBTCETHDONE && ETHUSDCDONE && WBTCUSDCDONE){
        exportData()
        process.exit()
    }
    console.log(event.blockNumber)
    if(pair === "WBTCETH" && event.blockNumber > lBlockWbtcEth) { //we have a new block. Sealing old
        sealBlock(pair, lBlockWbtcEth, event.blockNumber)
        lBlockWbtcEth = event.blockNumber
    } else if(pair === "ETHUSDC" && event.blockNumber > lBlockEthUsdc) {
        sealBlock(pair, lBlockEthUsdc, event.blockNumber)
        lBlockEthUsdc = event.blockNumber
    } else if(pair === "WBTCUSDC" && event.blockNumber > lBlockWbtcUsdc) {
        sealBlock(pair, lBlockWbtcUsdc, event.blockNumber)
        lBlockWbtcUsdc = event.blockNumber
    }
    let converter0;
    let converter1;
    if(pair === "ETHUSDC") { // since erc-20 token have different decimal places, we need custom converter logic for each pair
        converter0 = (num) => Number(converters.szaboToEth(num));
        converter1 = (num) => Number(converters.weiToEth(num));
    } else if( pair === "WBTCETH") {
        converter0 = (num) => Number(converters.gweiToEth(num) * 10);
        converter1 = (num) => Number(converters.weiToEth(num));
    } else if(pair === "WBTCUSDC") {
        converter0 = (num) => Number(converters.gweiToEth(num) * 10);
        converter1 = (num) => Number(converters.szaboToEth(num));
    }

    if(event.returnValues.amount0In === '0'){ //buying token0
        const selling = converter1(event.returnValues.amount1In)
        const buying = converter0(event.returnValues.amount0Out)
        const price0 = selling / buying;
        const price1 = buying / selling;
        derivePrice({block: event.blockNumber, price0, price1}, pair)
    } else { //selling token0
        const selling = converter0(event.returnValues.amount0In)
        const buying = converter1(event.returnValues.amount1Out)
        const price0 = buying / selling;
        const price1 = selling / buying;
        derivePrice({block: event.blockNumber, price0, price1}, pair)
    }
    return event.blockNumber;
}

const exportData = () => {
    try {
        fs.writeFileSync("./data.json", JSON.stringify(swaps))
    } catch (err) {
        console.error(err)
    }
}

const derivePrice = function(swap, pair) {
    // console.log(swap)
    if(swaps[swap.block]){ //next trades in block
        if(swaps[swap.block][pair].swapCount > 0){
            const currElem = swaps[swap.block][pair]
            const newPrice0 = calcNewAverage(currElem.swapCount, currElem.derivedPrice0, swap.price0)
            const newPrice1 = calcNewAverage(currElem.swapCount, currElem.derivedPrice1, swap.price1)
            swaps[swap.block][pair] = {swapCount: currElem.swapCount + 1, derivedPrice0: newPrice0, derivedPrice1: newPrice1}
        } else { // first pair entry for block
            swaps[swap.block][pair] = {derivedPrice0: swap.price0, derivedPrice1: swap.price1, swapCount: 1} 
        }
    } else { //first time block appears
        swaps[swap.block] = {
            WBTCETH: {
                derivedPrice0: 0, derivedPrice1: 0, swapCount: 0
            },
            ETHUSDC: {
                derivedPrice0: 0, derivedPrice1: 0, swapCount: 0
            },
            WBTCUSDC: {
                derivedPrice0: 0, derivedPrice1: 0, swapCount: 0
            }
        }
        swaps[swap.block][pair] = {derivedPrice0: swap.price0, derivedPrice1: swap.price1, swapCount: 1}
    }
}

const calcNewAverage = function(count, currentAverage, incomingPrice) { // calculates a new average 
    return currentAverage + ((incomingPrice - currentAverage) / (count + 1))
}

const sealBlock = function(pair, lastBlock, newBlock) { // this is used to fill gaps caused by some blocks not having any swaps for a pair
    const blockRange = range(lastBlock, newBlock - 1);
    for(let i = 0; i < blockRange.length; i++) {
        if(!swaps[blockRange[i]]){ // all pairs didn't swap in first missing block
            swaps[blockRange[i]] = swaps[lastBlock];
        } else {
            swaps[blockRange[i]][pair] = swaps[lastBlock][pair];
        }
        // console.log(blockRange[i], swaps[blockRange[i]])
    }
}

const range = (a,b) => Array(Math.abs(a-b)+1).fill(a).map((v,i)=>v+i*(a>b?-1:1)); // [a,b] <- inclusive range


invokeSwapListener()


// const getDerivedPrice = async function() {
//     const accounts = await web3.eth.getAccounts();
//     ethUsdcInstance.methods.price1CumulativeLast().call({from: accounts[0]}, 11620993)
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
