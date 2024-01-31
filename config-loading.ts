import fs from 'fs/promises';

export type Config = {
    http: { port: number }
    database: { databasePath: string }
}

export async function loadConfig() {
    // TODO: Resolve the naming conflict
    //  The typescript import lookup gets confused when there is both a "config-loading.ts" and a "config.json" file.
    //  So for now the JSON file is called config-store
    const config: Config = JSON.parse((await fs.readFile('./config.json')).toString());
    return config;
}


