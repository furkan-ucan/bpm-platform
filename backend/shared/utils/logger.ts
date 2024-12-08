import winston from 'winston';
import { env } from '@/config';

const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: env.nodeEnv === 'production' ? 'info' : 'debug',
    format,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
}); 