import winston from 'winston';
import path from 'path';

const myFormat = winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level.padEnd(5)}]: ${message}`);

export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console({
            level: 'debug'
        }),
        new winston.transports.File({
            filename: path.join(process.cwd(), 'command.log'),
            level: 'debug'
        })
    ]
});