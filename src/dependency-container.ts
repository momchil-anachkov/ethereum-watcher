import {asClass, asFunction, asValue, createContainer, InjectionMode, Lifetime } from 'awilix';

import {setupLogger} from './logger';
import {setupDbConnection} from './database/database';
import {loadConfig} from './config-loading';
import {RulingSystem} from './ruling-system/ruling-system';
import {
    CONFIG,
    SEQUELIZE,
    LOGGER,
    RULING_SYSTEM,
    REPOSITORY,
    API_SPEC,
    HTTP_SERVER,
    API_KEY,
    MONITORING_SYSTEM
} from './injection-tokens';
import {SQLiteSequelizeRepository} from './database/sqlite-sequelize.repository';
import {setupModels} from './models';
import {parse} from 'yaml';
import fs from 'fs/promises';
import {setupServer} from './http/server';
import {MonitoringSystem} from './monitoring-system/monitoring-system';

export async function setupContainer() {
    const container = createContainer({
        injectionMode: InjectionMode.PROXY,
        strict: true,
    });

    const apiSpec = parse(await fs.readFile('./openapi.yaml', 'utf-8'));
    const apiKey = await fs.readFile('api-key.txt');
    const config = await loadConfig();
    const sequelize = await setupDbConnection(config.database.databasePath);
    await setupModels(sequelize);

    container.register(CONFIG, asValue(config));
    container.register(API_KEY, asValue(apiKey));
    container.register(API_SPEC, asValue(apiSpec));
    container.register(LOGGER, asFunction(setupLogger, { lifetime: Lifetime.SINGLETON }));
    container.register(SEQUELIZE, asValue(sequelize));
    container.register(RULING_SYSTEM, asClass(RulingSystem, { lifetime: Lifetime.SINGLETON }));
    container.register(REPOSITORY, asClass(SQLiteSequelizeRepository, { lifetime: Lifetime.SINGLETON }));
    container.register(HTTP_SERVER, asFunction(setupServer));
    container.register(MONITORING_SYSTEM, asClass(MonitoringSystem, {lifetime: Lifetime.SINGLETON }));

    return container;
}


