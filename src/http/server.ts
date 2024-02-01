import express, {Express} from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import * as swaggerUi from 'swagger-ui-express';
import {RuleLookupFields} from '../models';
import {API_SPEC, LOGGER, RULING_SERVICE, TRANSACTIONS_SERVICE} from '../injection-tokens';
import winston from 'winston';
import bodyParser from 'body-parser';
import {RulingService} from '../ruling/ruling.service';
import {TransactionsService} from '../transactions/transactions.service';

export function setupServer(opts: any): Express {
    const server = express();
    const apiSpec = opts[API_SPEC];
    const logger: winston.Logger = opts[LOGGER];
    const rulingService: RulingService = opts[RULING_SERVICE];
    const transactionsService: TransactionsService = opts[TRANSACTIONS_SERVICE];

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

    server.get('/rules', async (req, res) => {
        try {
            const lookupFields: RuleLookupFields = req.query;
            const rules = await rulingService.getRules(lookupFields);
            res.json(rules);
        } catch (e) {
            res.status(500).json({status: 500, message: e.message});
        }
    });

    server.get('/rules/:id/', async (req, res) => {
        try {
            const id: number = parseInt(req.params.id, 10);
            const rule = await rulingService.getRuleById(id);
            if (rule != null) {
                res.json(rule);
            } else {
                res.status(404).json({status: 401, message: 'Rule not found'})
            }
        } catch (e) {
            res.status(500).json({status: 500, message: e.message});
        }
    });

    server.post('/rules', async (req, res) => {
        try {
            const createdRule = await rulingService.createRule(req.body);
            res.json(createdRule);
        } catch (e) {
            res.status(401).json({status: 401, message: e.message});
        }
    });

    server.patch('/rules/:id/', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const rule = await rulingService.setRuleActive(id, req.body.active);
            if (!rule) {
                res.status(404).json({status: 404, message: `No rule with id: ${id}`});
            } else {
                res.json(rule);
            }
        } catch (e) {
            res.status(500).json({status: 401, message: e.message});
        }
    });

    server.get('/transactions/', async(req, res) => {
        try {
            const lookupFields = req.query;
            const transactions = await transactionsService.getTransactions(lookupFields)
            res.json(transactions);
        } catch (e) {
            res.status(500).json({status: 500, message: e.message});
        }
    });

    server.delete('/rules/:id/', async (req, res) => {
        const id: number = parseInt(req.params.id, 10);
        try {
            const deletedCount = await rulingService.deleteRule(id);
            res.json({deletedCount});
        } catch (e) {
            res.status(500).json({status: 500, message: e.message});
        }
    });

    return server;
}

