import {Sequelize} from 'sequelize';
import {Repository} from './repository';
import {EthereumTransaction, Rule} from '../models';
import {SEQUELIZE} from '../injection-tokens';

export class SQLiteSequelizeRepository extends Repository {
    private readonly sequelize: Sequelize;

    constructor(opts: any) {
        super();
        this.sequelize = opts[SEQUELIZE];
    }

    async saveRule(ruleToSave: Rule): Promise<Rule> {
        return await Rule.create(ruleToSave, { isNewRecord: true });
    }

    async saveManyEthTransactions(transactions: EthereumTransaction[]): Promise<EthereumTransaction[]> {
        return await EthereumTransaction.bulkCreate(transactions);
    }

    async getActiveRules(): Promise<Rule[]> {
        return await Rule.findAll({where: {active: true}});
    }
}
