import winston, {Logger} from 'winston';

export function setupLogger(): Logger {
    return winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        ]
    })
}