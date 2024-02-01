import winston from 'winston';
import {DataRepository} from '../database/data.repository';
import {EthereumTransaction, PendingEthereumTransaction, Rule, RuleLookupFields} from '../models';
import {LOGGER, REPOSITORY} from '../injection-tokens';
import {JoinCriteria, objectMatchesSelectionCriteria, ruleCriteriaIsValid} from './ruling-system';

export class RulingService {
    private readonly logger: winston.Logger;
    private readonly repository: DataRepository;
    private activeRules: Map<number, Rule> = new Map<number, Rule>();

    constructor(opts: any) {
        this.repository = opts[REPOSITORY];
        this.logger = opts[LOGGER];
    }

    async createRule(ruleToCreate: Rule): Promise<Rule> {
        try {
            if (!ruleCriteriaIsValid(ruleToCreate.criteria)) {
                throw new Error('Rule criteria format invalid');
            }

            const rule = await this.repository.createRule(ruleToCreate);
            if (rule.active) {
                this.activeRules?.set(rule.id, rule);
            }
            return rule;
        } catch (e) {
            this.logger.error(`Failed to create rule: ${e.message}`)
            throw e;
        }
    }

    async deleteRule(id: number): Promise<number> {
        try {
            const deletedCount = await this.repository.deleteRuleById(id);
            if (deletedCount > 1) {
                this.logger.error('Deleted more than 1 rule by id');
            }

            this.activeRules.delete(id);

            return deletedCount;
        } catch (e) {
            this.logger.error(`Failed to delete rule: ${e.message}`)
            return 0;
        }
    }

    async setRuleActive(id: number, active: boolean): Promise<Rule | null> {
        if (active) {
            const transaction = await this.repository.startTransaction();
            try {
                const rule = await this.repository.getRuleById(id, transaction);
                if (rule) {
                    this.activeRules.set(rule.id, rule);
                    await this.repository.setRuleActive(id, active, transaction);
                }
                await this.repository.commitTransaction(transaction);
                return rule;
            } catch (e) {
                await this.repository.rollbackTransaction(transaction);
                this.logger.error(`Failed to set rule state. Value: ${active}, Id: ${id}, Error: ${e.message}`);
                return null;
            }
        } else {
            const rule = this.activeRules.get(id) ?? null;
            this.activeRules.delete(id);
            await this.repository.setRuleActive(id, active);
            return rule;
        }
    }

    async init(): Promise<void> {
        const activeRules = await this.repository.getRules({active: true})
        for (const rule of activeRules) {
            this.activeRules.set(rule.id, rule);
        }
    }

    async processTransactions(blockNumber: bigint, transactions: EthereumTransaction[]): Promise<ProcessingResult> {

        const transaction = await this.repository.startTransaction();
        try {
            const activeRules = Array.from(this.activeRules.values());
            const immediateRules = activeRules.filter((rule) => rule.delay === 0);
            const delayedRules = activeRules.filter((rule) => rule.delay > 0);

            const transactionsToSaveNow: EthereumTransaction[] = [];
            for (const rule of immediateRules) {
                for (const transactionData of transactions as EthereumTransaction[]) {
                    if (objectMatchesSelectionCriteria(transactionData as any, rule.criteria, rule.criteria[0] as JoinCriteria)) {
                        transactionsToSaveNow.push({...transactionData, ruleId: rule.id} as any);
                    }
                }
            }

            const transactionsToSaveForLater: PendingEthereumTransaction[] = [];
            for (const rule of delayedRules) {
                for (const transactionData of transactions as EthereumTransaction[]) {
                    if (objectMatchesSelectionCriteria(transactionData as any, rule.criteria, rule.criteria[0] as JoinCriteria)) {
                        transactionsToSaveForLater.push({
                            ...transactionData,
                            ruleId: rule.id,
                            blockDeadline: blockNumber + BigInt(rule.delay),
                        } as any);
                    }
                }
            }

            const pendingTransactionsFromBefore = await this.repository.getPendingEthTransactions(blockNumber);
            const pendingTransactionsIds = pendingTransactionsFromBefore.map((t) => t.id);

            // FIXME: This is really gross, but sequelize gets super-confused when you pass data from one model directly into another
            //   so we have to map over them and extract the raw data
            //   also the id columns clash, so we need to remove them
            const pendingTransactionsRawData = pendingTransactionsFromBefore.map((t) => ({ ...t.dataValues }));
            pendingTransactionsRawData.forEach((t) => { delete (t as any).id })

            const transactionsToSave = transactionsToSaveNow.concat(pendingTransactionsFromBefore.map((t) => t.dataValues) as any);
            for (const transaction of transactionsToSave) {
                delete (transaction as any).id;
            }

            const inserted = await this.repository.saveManyEthTransactions(transactionsToSave, transaction);
            await this.repository.deletePendingEthTransactions(pendingTransactionsIds, transaction);
            const insertedForLater = await this.repository.saveManyPendingEthTransactions(transactionsToSaveForLater, transaction);

            await this.repository.commitTransaction(transaction);

            return {
                saved: inserted,
                savedPending: insertedForLater,
            };
        } catch (e) {
            await this.repository.rollbackTransaction(transaction);
            this.logger.error(`Processing failed: ${e.message}`);
            return {
                saved: [],
                savedPending: [],
            };
        }
    }

    async getRules(ruleFields?: RuleLookupFields): Promise<Rule[]> {
        return this.repository.getRules(ruleFields);
    }

    async getRuleById(id: number): Promise<Rule | null> {
        return this.repository.getRuleById(id);
    }
}

type ProcessingResult = {
    saved: EthereumTransaction[];
    savedPending: PendingEthereumTransaction[];
}