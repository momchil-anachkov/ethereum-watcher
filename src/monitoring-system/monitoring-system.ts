import {JoinCriteria, objectMatchesSelectionCriteria} from '../ruling/ruling-system';
import {API_KEY, LOGGER, RULING_SERVICE} from '../injection-tokens';
import winston from 'winston';
import {Web3} from 'web3';
import {EthereumTransaction} from '../models';
import {RulingService} from '../ruling/ruling.service';

export class MonitoringSystem {
    private readonly rulingSystem: RulingService;
    private readonly web3: Web3;
    private readonly logger: winston.Logger;

    constructor(opts: any) {
        this.rulingSystem = opts[RULING_SERVICE];
        this.logger = opts[LOGGER];
        const apiKey = opts[API_KEY];
        const providerUrl = `wss://mainnet.infura.io/ws/v3/${apiKey}`;
        const web3Provider = new Web3.providers.WebsocketProvider(providerUrl);
        this.web3 = new Web3(web3Provider);
    }

    async startMonitoring() {
        const currentBlockNumber = await this.web3.eth.getBlockNumber();
        this.logger.info(`Latest Block: ${currentBlockNumber}`);

        const subscription = await this.web3.eth.subscribe("newHeads")

        subscription.on('data', async (blockHeader) => {
            this.logger.info(`New Block: ${blockHeader.number}`);

            const blockNumber = blockHeader.number;
            const block = await this.web3.eth.getBlock(blockNumber, true);

            if (block?.transactions != null) {
                this.logger.info(`Block transaction count: ${block.transactions.length}`);
                const result = await this.rulingSystem.processTransactions(block.number, block.transactions as EthereumTransaction[]);
                this.logger.info(`Block: ${blockHeader.number} processed. Saved ${result.saved.length}. Saved for delayed processing: ${result.savedPending.length}`);
            } else {
                this.logger.warn('Block was null');
            }
        });
    }
}