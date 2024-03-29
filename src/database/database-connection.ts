import {Sequelize} from 'sequelize';

export async function setupDbConnection(databasePath: string): Promise<Sequelize> {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: databasePath,
        logging: false,
    });

    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }

    return sequelize;
}
