import winston from 'winston';
import {DataRepository} from '../database/data-repository';
import {EthereumTransaction, Rule, RuleLookupFields} from '../models';
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

            const rule = await this.repository.saveRule(ruleToCreate);
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

    async init(): Promise<void> {
        const activeRules = await this.repository.getRules({active: true})
        for (const rule of activeRules) {
            this.activeRules.set(rule.id, rule);
        }
    }

    async processTransactions(transactions: EthereumTransaction[]) {
        const activeRules = Array.from(this.activeRules.values());

        const transactionsToInsert: EthereumTransaction[] = [];
        for (const transactionData of transactions as EthereumTransaction[]) {
            for (const rule of activeRules) {
                if (objectMatchesSelectionCriteria(transactionData as any, rule.criteria, rule.criteria[0] as JoinCriteria)) {
                    transactionsToInsert.push({...transactionData, ruleId: rule.id} as any);
                }
            }
        }

        const inserted = await this.repository.saveManyEthTransactions(transactionsToInsert);
        return inserted;
    }

    async getRules(ruleFields?: RuleLookupFields): Promise<Rule[]> {
        return this.repository.getRules(ruleFields);
    }

    async getRuleById(id: number): Promise<Rule | null> {
        return this.repository.getRuleById(id);
    }
}