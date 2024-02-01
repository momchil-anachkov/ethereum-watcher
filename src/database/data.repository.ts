import {
    EthereumTransaction,
    EthereumTransactionLookupFields,
    PendingEthereumTransaction,
    Rule,
    RuleLookupFields
} from '../models';

export abstract class DataRepository {
    abstract createRule(ruleToCreate: Rule): Promise<Rule>;
    abstract getRules(ruleFields?: RuleLookupFields): Promise<Rule[]>;
    abstract getRuleById(id: number, transaction?: any): Promise<Rule | null>;
    abstract setRuleActive(id: number, active: boolean, transaction?: any): Promise<number>;
    abstract deleteRuleById(id: number): Promise<number>;
    abstract saveManyEthTransactions(transactions: EthereumTransaction[], databaseTransaction?: any): Promise<EthereumTransaction[]>;
    abstract saveManyPendingEthTransactions(transactions: PendingEthereumTransaction[], databaseTransaction?: any): Promise<PendingEthereumTransaction[]>;
    abstract getTransactions(lookupFields: EthereumTransactionLookupFields, databaseTransaction?: any): Promise<EthereumTransaction[]>;
    abstract getPendingEthTransactions(blockDeadline: bigint): Promise<PendingEthereumTransaction[]>;
    abstract deletePendingEthTransactions(ids: number[], databaseTransaction?: any): Promise<number>;

    abstract startTransaction(): Promise<any>;
    abstract commitTransaction(transaction: any): Promise<void>;
    abstract rollbackTransaction(transaction: any): Promise<void>;
}