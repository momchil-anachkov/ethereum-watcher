import fs from 'fs/promises';
import { Web3 } from 'web3';

// JSON.stringify needs some help with BigInt-s
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
}

const headsLogFile = await fs.open('./heads.log', 'a');
const blocksLogFile = await fs.open('./blocks.log', 'a');
const transactionsLogFile = await fs.open('./transactions.log', 'a');

const apiKey = await fs.readFile('api-key.txt');

var provider = `wss://mainnet.infura.io/ws/v3/${apiKey}`;
var web3Provider = new Web3.providers.WebsocketProvider(provider);
var web3 = new Web3(web3Provider);

web3.eth.getBlockNumber().then((result) => {
    console.log('Latest Block: ', result);
});

const subscription = await web3.eth.subscribe("newHeads")

subscription.on('data', async (blockHeader) => {
    console.log('New Block: ', blockHeader.number)

    const blockHeaderSerialized = JSON.stringify(blockHeader, null, 4);
    await headsLogFile.appendFile(blockHeaderSerialized + '\n');

    const blockNumber = blockHeader.number;
    const block = await web3.eth.getBlock(blockNumber, true);

    const blockSerialized = JSON.stringify(block, null, 4);
    await blocksLogFile.appendFile(blockSerialized + '\n');

    let transactionsSerialized = '';
    for (const transaction of block.transactions) {
        transactionsSerialized += JSON.stringify(transaction) + '\n';
    }
    await transactionsLogFile.appendFile(transactionsSerialized + '\n');
});
