import fs from 'fs/promises';

export type Config = {
    databasePath: string,
}

export async function loadConfig(path: string) {
    // TODO: Resolve the naming conflict
    //  The typescript import lookup gets confused when there is a "config.ts" and a "config-store.json" file.
    //  So for now the JSON file is called config-store
    const config: Config = JSON.parse((await fs.readFile(path)).toString());
    return config;
}


