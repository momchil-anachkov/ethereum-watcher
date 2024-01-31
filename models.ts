import {Sequelize, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize';
import {RuleCriteria} from './ruling-system';

export class Rule extends Model<InferAttributes<Rule>, InferCreationAttributes<Rule>> {
    declare id: BigInt;
    declare criteria: RuleCriteria[];
}

export class Transaction extends Model<InferAttributes<Transaction>, InferCreationAttributes<Transaction>> {
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
        id: {type: DataTypes.BIGINT, primaryKey: true},
        criteria: {type: DataTypes.JSON}
    }, {sequelize});

    Transaction.init({
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

    Rule.hasMany(Transaction)
    Transaction.belongsTo(Rule);

    await Transaction.sync({force: true});
    await Rule.sync({force: true});
}