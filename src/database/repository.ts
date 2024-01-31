import {EthereumTransaction, Rule} from '../models';

export abstract class Repository {
    abstract saveRule(ruleToSave: Rule): Promise<Rule>;
    abstract getActiveRules(): Promise<Rule[]>;
    abstract saveManyEthTransactions(transactions: EthereumTransaction[]): Promise<EthereumTransaction[]>;
}