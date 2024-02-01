import fs from 'fs/promises';

export type Config = {
    http: { port: number }
    database: { databasePath: string }
}

export async function loadConfig() {
    //  The typescript import lookup gets confused when there is both a "config.ts" and a "config.json" file.
    //  So for now this file is called config-loading.ts
    const config: Config = JSON.parse((await fs.readFile('./config.json')).toString());
    return config;
}


