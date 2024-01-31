import "./patches";
import fs from 'fs/promises';
import { Web3 } from 'web3';
import {setupModels, Transaction} from './models';
import {setupDbConnection} from './database';
import {loadConfig} from './config-loading';
import {matchesSelectionCriteria, RuleCriteria} from './ruling-system';
import {setupLogger} from './logger';
import {setupServer} from './server';

(async function main() {
    const logger = setupLogger();

    const config = await loadConfig();


    const server = await setupServer();
    server.listen(config.http.port);

    const sequelize = await setupDbConnection(config.database.databasePath);
    await setupModels(sequelize);
    const apiKey = await fs.readFile('api-key.txt');

    const headsLogFile = await fs.open('./heads.log', 'a');
    const blocksLogFile = await fs.open('./blocks.log', 'a');
    const transactionsLogFile = await fs.open('./transactions.log', 'a');

    var provider = `wss://mainnet.infura.io/ws/v3/${apiKey}`;
    var web3Provider = new Web3.providers.WebsocketProvider(provider);
    var web3 = new Web3(web3Provider);

    web3.eth.getBlockNumber().then((result) => {
        console.log('Latest Block: ', result);
    });

    const subscription = await web3.eth.subscribe("newHeads")

    subscription.on('data', async (blockHeader) => {
        logger.info(`New Block: ${blockHeader.number}`);

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

        const criteria: RuleCriteria = [{ $and: [{ value: { $gt: 0n } }] }]

        // TODO: HTTP Server with CRUD for rules
        // TODO: Load rules from the database
        // TODO: Load rules on startup
        // TODO: Parse blocks with delay
        //       Save transactions to a pending table
        //       On each new block, check the diff, and permanently save pending transactions that fulfill the delay
        // TODO: Logging
        // TODO: Transactions
        // TODO: Error handling. We currently assume a happy-path everywhere.

        // Lower Priority
        // TODO: Dependency Injection
        // TODO: More extensive tests for the rule system






        // FIXME
        //  for (const transaction of block.transactions) {
        //  TypeError: Cannot read properties of null (reading 'transactions')
        //      at EventEmitter.<anonymous> (/Users/anamodev/projects/homeworks/nexo/ethereum-watcher/main.ts:51:41)
        const filteredTransactions = (block.transactions as any[])
            .filter((transaction) => matchesSelectionCriteria(transaction, criteria, criteria[0]));

        await Transaction.bulkCreate(filteredTransactions as Transaction[]);
    });
})();


