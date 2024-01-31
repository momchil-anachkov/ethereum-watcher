import "./patches";
import {Config} from './config-loading';
import {setupContainer} from './dependency-container';
import {CONFIG, HTTP_SERVER, MONITORING_SYSTEM, RULING_SYSTEM} from './injection-tokens';
import {Express} from 'express';
import {MonitoringSystem} from './monitoring-system/monitoring-system';

(async function main() {
    const container = await setupContainer();

    const config: Config = container.resolve(CONFIG);
    const httpServer: Express = container.resolve(HTTP_SERVER);
    httpServer.listen(config.http.port);

    const monitoringSystem: MonitoringSystem = container.resolve(MONITORING_SYSTEM);
    await monitoringSystem.startMonitoring();

    // const providerUrl = `wss://mainnet.infura.io/ws/v3/${apiKey}`;
    // const web3Provider = new Web3.providers.WebsocketProvider(providerUrl);
    // const web3 = new Web3(web3Provider);
    // web3.eth.getBlockNumber().then((result) => {
    //     console.log('Latest Block: ', result);
    // });

    // const subscription = await web3.eth.subscribe("newHeads")

    // subscription.on('data', async (blockHeader) => {
    //     logger.info(`New Block: ${blockHeader.number}`);
    //
    //     // const blockHeaderSerialized = JSON.stringify(blockHeader, null, 4);
    //     // await headsLogFile.appendFile(blockHeaderSerialized + '\n');
    //
    //     const blockNumber = blockHeader.number;
    //     const block = await web3.eth.getBlock(blockNumber, true);
    //
    //     // const blockSerialized = JSON.stringify(block, null, 4);
    //     // await blocksLogFile.appendFile(blockSerialized + '\n');
    //
    //     // let transactionsSerialized = '';
    //     // for (const transaction of block.transactions) {
    //     //     transactionsSerialized += JSON.stringify(transaction) + '\n';
    //     // }
    //     // await transactionsLogFile.appendFile(transactionsSerialized + '\n');
    //
    //     const criteria: RuleCriteria = [{ $and: [{ value: { $gt: 0n } }] }]
    //
    //     // TODO: HTTP Server with CRUD for rules
    //     // TODO: Load rules from the database
    //     // TODO: Load rules on startup
    //     // TODO: Parse blocks with delay
    //     //       Save transactions to a pending table
    //     //       On each new block, check the diff, and permanently save pending transactions that fulfill the delay
    //     // TODO: Logging
    //     // TODO: Transactions
    //     // TODO: Error handling. We currently assume a happy-path everywhere.
    //
    //     // Lower Priority
    //     // TODO: Dependency Injection
    //     // TODO: More extensive tests for the rule system
    //
    //
    //
    //
    //
    //
    //     // FIXME
    //     //  for (const transaction of block.transactions) {
    //     //  TypeError: Cannot read properties of null (reading 'transactions')
    //     //      at EventEmitter.<anonymous> (/Users/anamodev/projects/homeworks/nexo/ethereum-watcher/src.ts:51:41)
    //     const filteredTransactions = (block.transactions as any[])
    //         .filter((transaction) => matchesSelectionCriteria(transaction, criteria, criteria[0]));
    //
    //     const result = await EthereumTransaction.bulkCreate(filteredTransactions as EthereumTransaction[]);
    // });
})();


