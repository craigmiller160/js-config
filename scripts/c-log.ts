import path from 'path';
import fs from 'fs';

export type LogToStdout = (logText: string) => void;

export const execute = (
	// eslint-disable-next-line no-console
	logToStdout: LogToStdout = console.log,
	currentDirectory: string = __dirname
) => {
	const logText = fs.readFileSync(
		path.join(currentDirectory, '..', 'command.log'),
		'utf8'
	);
	logToStdout(logText);
};
