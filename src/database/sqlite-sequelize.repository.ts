import {Sequelize} from 'sequelize';
import {DataRepository} from './data-repository';
import {EthereumTransaction, EthereumTransactionLookupFields, Rule} from '../models';
import {SEQUELIZE} from '../injection-tokens';

export class SQLiteSequelizeRepository extends DataRepository {
    private readonly sequelize: Sequelize;

    constructor(opts: any) {
        super();
        this.sequelize = opts[SEQUELIZE];
    }

    async saveRule(ruleToSave: Rule): Promise<Rule> {
        return await Rule.create(ruleToSave);
    }

    async saveManyEthTransactions(transactions: EthereumTransaction[]): Promise<EthereumTransaction[]> {
        return await EthereumTransaction.bulkCreate(transactions);
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
}
