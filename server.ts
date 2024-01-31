import express, {Express} from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import * as swaggerUi from 'swagger-ui-express';
import fs from 'fs/promises';
import { parse } from 'yaml';

export async function setupServer(): Promise<Express> {
    const server = express();
    const apiSpec = parse(await fs.readFile('./openapi.yaml', 'utf-8'));

    server.use(
        OpenApiValidator.middleware({
            apiSpec: './openapi.yaml',
            validateRequests: true,
            validateResponses: true,
            ignorePaths: () => ['/api-docs'],
        })
    );

    server.use('/api-docs', swaggerUi.serve);
    server.get('/api-docs', swaggerUi.setup(apiSpec))

    server.get('/', (req, res) => {
        res.send(`Hello, ${req.query.name ?? 'Sailor'}!`)
    });

    return server;
}

