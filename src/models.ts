import {Sequelize, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';
import {RuleCriteria} from './ruling-system/ruling-system';

// Models are a little leaky, because they depend on sequelize
// Something to think about is pulling out the attributes into our own model
// and just join them here in order to decouple from the database implementation

export class Rule extends Model<InferAttributes<Rule>, InferCreationAttributes<Rule>> {
    declare id: number;
    declare active: boolean;
    declare criteria: RuleCriteria;
}

export class EthereumTransaction extends Model<InferAttributes<EthereumTransaction>, InferCreationAttributes<EthereumTransaction>> {
    declare blockHash: string;
    declare blockNumber: bigint;
    declare from: string;
    declare gasPrice: bigint;
    declare hash: string;
    declare to: string;
    declare transactionIndex: bigint;
    declare type: bigint;
    declare value: bigint;
}

export async function setupModels(sequelize: Sequelize) {
    Rule.init({
        id: {type: DataTypes.INTEGER, primaryKey: true},
        active: {type: DataTypes.BOOLEAN, allowNull: false},
        criteria: {type: DataTypes.JSON}
    }, {sequelize});

    EthereumTransaction.init({
        blockHash: {type: DataTypes.STRING},
        blockNumber: {type: DataTypes.STRING},
        from: {type: DataTypes.STRING},
        gasPrice: {type: DataTypes.BIGINT},
        hash: {type: DataTypes.STRING, primaryKey: true},
        to: {type: DataTypes.STRING},
        transactionIndex: {type: DataTypes.BIGINT},
        type: {type: DataTypes.BIGINT},
        value: {type: DataTypes.BIGINT},
    }, {sequelize});

    // FIXME: Transaction hashes are duplicated if the transaction matches multiple rules
    //  Either make the transaction key (ruleId+hash)
    //  Or just have an Id for the transactions and don't worry about it - PROBABLY THIS
    //  Or make a many-to-many relation, where we can link transactions and rules independently

    EthereumTransaction.belongsTo(Rule, { foreignKey: { allowNull: false } });
    // Rule.hasMany(EthereumTransaction);

    await EthereumTransaction.sync({force: true});
    await Rule.sync({alter: true});

    // await sequelize.sync({ alter: true });
}