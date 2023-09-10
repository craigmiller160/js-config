import { format, createLogger, transports } from 'winston';
import path from 'path';

const myFormat = format.printf(
	({ level, message, timestamp }) =>
		`${timestamp} [${level.padEnd(5)}]: ${message}`
);

export const logger = createLogger({
	level: 'debug',
	format: format.combine(format.timestamp(), myFormat),
	transports: [
		new transports.Console({
			level: 'debug'
		}),
		new transports.File({
			filename: path.join(__dirname, '..', '..', 'command.log'),
			level: 'debug'
		})
	]
});
