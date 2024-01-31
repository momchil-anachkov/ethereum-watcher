import express, {Express} from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import * as swaggerUi from 'swagger-ui-express';
import {Rule} from '../models';
import {API_SPEC, LOGGER, RULING_SYSTEM} from '../injection-tokens';
import winston from 'winston';
import bodyParser from 'body-parser';
import {RulingSystem} from '../ruling-system/ruling-system';

export function setupServer(opts: any): Express {
    const server = express();
    const apiSpec = opts[API_SPEC];
    const logger: winston.Logger = opts[LOGGER];
    const rulingSystem: RulingSystem = opts[RULING_SYSTEM];

    server.use(bodyParser.json());

    server.use(
        OpenApiValidator.middleware({
            apiSpec: './openapi.yaml',
            validateRequests: true,
            validateResponses: true,
            ignorePaths: (path: string) => path.startsWith('/api-docs'),
        })
    );

    server.use('/api-docs', swaggerUi.serve);
    server.get('/api-docs', swaggerUi.setup(apiSpec));

    server.get('/', (req, res) => {
        res.send(`Hello, ${req.query.name ?? 'Sailor'}!`)
    });

    server.get('/rules', (req, res) => {
        // TODO
    });

    server.post('/rules', async (req, res) => {
        await rulingSystem.createRule(req.body);
        const rule = req.body as Rule;
        console.log(req.body);
        logger.info(rule);
        res.send(req.body);
        // TODO
    });

    server.put('/rules', (req, res) => {
        // TODO
    });

    return server;
}

