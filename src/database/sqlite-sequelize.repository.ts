import {Sequelize, Transaction, Op} from 'sequelize';
import {DataRepository} from './data.repository';
import {EthereumTransaction, EthereumTransactionLookupFields, PendingEthereumTransaction, Rule} from '../models';
import {LOGGER, SEQUELIZE} from '../injection-tokens';
import winston from 'winston';

export class SQLiteSequelizeRepository extends DataRepository {
    private readonly sequelize: Sequelize;
    private readonly logger: winston.Logger;

    constructor(opts: any) {
        super();
        this.sequelize = opts[SEQUELIZE];
        this.logger = opts[LOGGER];
    }

    async createRule(ruleToCreate: Rule): Promise<Rule> {
        return await Rule.create(ruleToCreate);
    }

    async saveManyEthTransactions(transactions: EthereumTransaction[], databaseTransaction?: Transaction): Promise<EthereumTransaction[]> {
        return await EthereumTransaction.bulkCreate(transactions, {  transaction: databaseTransaction });
    }

    async saveManyPendingEthTransactions(transactions: PendingEthereumTransaction[], databaseTransaction?: Transaction): Promise<PendingEthereumTransaction[]> {
        return await PendingEthereumTransaction.bulkCreate(transactions, { transaction: databaseTransaction });
    }

    async getPendingEthTransactions(blockDeadline: bigint): Promise<PendingEthereumTransaction[]> {
        return await PendingEthereumTransaction.findAll({
            include: { model: Rule, where: { active: true } },
            where: { blockDeadline: { [Op.lte]: blockDeadline } } });
    }

    async deletePendingEthTransactions(ids: number[], databaseTransaction?: Transaction): Promise<number> {
        // return await PendingEthereumTransaction.destroy({where: { blockDeadline: { [Op.in]: blockDeadline } }, transaction: databaseTransaction });
        return await PendingEthereumTransaction.destroy({where: { id: { [Op.in]: ids } }, transaction: databaseTransaction });

    }

    async getRules(ruleFields?: { active?: boolean }): Promise<Rule[]> {
        if (ruleFields) {
            return await Rule.findAll({ where: ruleFields });
        } else {
            return await Rule.findAll();
        }
    }

    async getTransactions(lookupFields: EthereumTransactionLookupFields): Promise<EthereumTransaction[]> {
        return await EthereumTransaction.findAll({where: lookupFields });
    }

    async deleteRuleById(id: number): Promise<number> {
        return await Rule.destroy({ where: { id } });
    }

    async getRuleById(id: number): Promise<Rule | null> {
        return await Rule.findOne({ where: { id }});
    }

    async startTransaction(): Promise<Transaction> {
        return this.sequelize.transaction();
    }

    async commitTransaction(transaction: Transaction): Promise<void> {
        await transaction.commit();
    }

    async rollbackTransaction(transaction: Transaction): Promise<void> {
        await transaction.rollback();
    }

    async setRuleActive(id: number, active: boolean, transaction?: Transaction): Promise<number> {
        const updateResult = (await Rule.update({ active }, { where: { id }, transaction }));
        return updateResult[0];
    }
}
