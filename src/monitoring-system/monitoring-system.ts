import {JoinCriteria, matchesSelectionCriteria, RulingSystem} from '../ruling-system/ruling-system';
import {API_KEY, LOGGER, RULING_SYSTEM} from '../injection-tokens';
import winston from 'winston';
import {Web3} from 'web3';
import {EthereumTransaction} from '../models';

export class MonitoringSystem {
    private readonly rulingSystem: RulingSystem;
    private readonly web3: Web3;
    private readonly logger: winston.Logger;

    constructor(opts: any) {
        this.rulingSystem = opts[RULING_SYSTEM];
        this.logger = opts[LOGGER];
        const apiKey = opts[API_KEY];
        const providerUrl = `wss://mainnet.infura.io/ws/v3/${apiKey}`;
        const web3Provider = new Web3.providers.WebsocketProvider(providerUrl);
        this.web3 = new Web3(web3Provider);
    }

    async startMonitoring() {
        const currentBlockNumber = await this.web3.eth.getBlockNumber();
        console.log('Latest Block: ', currentBlockNumber);

        const subscription = await this.web3.eth.subscribe("newHeads")

        subscription.on('data', async (blockHeader) => {
            this.logger.info(`New Block: ${blockHeader.number}`);

            const blockNumber = blockHeader.number;
            const block = await this.web3.eth.getBlock(blockNumber, true);

            const transactions = await this.rulingSystem.processTransactions(block.transactions as EthereumTransaction[]);


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





            // const criteria: RuleCriteria = [{ $and: [{ value: { $gt: 0n } }] }]
            //
            // // FIXME
            // //  for (const transaction of block.transactions) {
            // //  TypeError: Cannot read properties of null (reading 'transactions')
            // //      at EventEmitter.<anonymous> (/Users/anamodev/projects/homeworks/nexo/ethereum-watcher/src.ts:51:41)
            // const filteredTransactions = (block.transactions as any[])
            //     .filter((transaction) => matchesSelectionCriteria(transaction, criteria, criteria[0]));

            // const result = await EthereumTransaction.bulkCreate(filteredTransactions as EthereumTransaction[]);
        });
    }
}