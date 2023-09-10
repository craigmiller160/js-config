import { format, createLogger, transports } from 'winston';
import path from 'path';
import fs from 'fs';

const myFormat = format.printf(
	({ level, message, timestamp }) =>
		`${timestamp} [${level.padEnd(5)}]: ${message}`
);

export const LOG_FILE = path.join(__dirname, '..', '..', 'command.log');
// if (fs.existsSync(LOG_FILE)) {
// 	fs.rmSync(LOG_FILE, {
// 		force: true
// 	});
// }

export const logger = createLogger({
	level: 'debug',
	format: format.combine(format.timestamp(), myFormat),
	transports: [
		new transports.Console({
			level: 'debug'
		}),
		new transports.File({
			filename: LOG_FILE,
			level: 'debug'
		})
	]
});
