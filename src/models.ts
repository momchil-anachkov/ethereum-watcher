import {Sequelize, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';
import {RuleCriteria} from './ruling/ruling-system';

// Models are a little leaky, because they depend on sequelize
// Something to think about is pulling out the attributes into our own model
// and just join them here in order to decouple from the database implementation

export type RuleLookupFields = {
    active?: boolean;
}

export type EthereumTransactionLookupFields = {
    ruleId?: number;
    hash?: string;
    blockHash?: string;
    blockNumber?: string;
}

export class Rule extends Model<InferAttributes<Rule>, InferCreationAttributes<Rule>> {
    declare id: number;
    declare active: boolean;
    declare criteria: RuleCriteria;
}

export class EthereumTransaction extends Model<InferAttributes<EthereumTransaction>, InferCreationAttributes<EthereumTransaction>> {
    declare id: string;
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
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        active: {type: DataTypes.BOOLEAN, allowNull: false},
        criteria: {type: DataTypes.JSON}
    }, {sequelize});

    EthereumTransaction.init({
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        blockHash: {type: DataTypes.STRING},
        blockNumber: {type: DataTypes.STRING},
        from: {type: DataTypes.STRING},
        gasPrice: {type: DataTypes.BIGINT},
        hash: {type: DataTypes.STRING},
        to: {type: DataTypes.STRING},
        transactionIndex: {type: DataTypes.BIGINT},
        type: {type: DataTypes.BIGINT},
        value: {type: DataTypes.BIGINT},
    }, {
        indexes: [
            { fields: ['hash'] },
            { fields: ['blockHash'] },
            { fields: ['blockNumber'] },
        ],
        sequelize
    });

    // FIXME: Empty criteria logs everything

    EthereumTransaction.belongsTo(Rule, { onDelete: 'CASCADE', foreignKey: { name:'ruleId', allowNull: false } });

    await EthereumTransaction.sync({force: true});
    await Rule.sync({force: true});

}