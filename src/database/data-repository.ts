import {EthereumTransaction, EthereumTransactionLookupFields, Rule, RuleLookupFields} from '../models';

export abstract class DataRepository {
    abstract saveRule(ruleToSave: Rule): Promise<Rule>;
    abstract getRules(ruleFields?: RuleLookupFields): Promise<Rule[]>;
    abstract getRuleById(id: number): Promise<Rule | null>;
    abstract deleteRuleById(id: number): Promise<number>;
    abstract saveManyEthTransactions(transactions: EthereumTransaction[]): Promise<EthereumTransaction[]>;
    abstract getTransactions(lookupFields: EthereumTransactionLookupFields): Promise<EthereumTransaction[]>;
}