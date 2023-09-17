import { describe, it, expect } from 'vitest';
import path from 'path';
import { execute, LogToStdout } from '../../src/scripts/c-log';

const LOG_FILE = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'log',
	'command.log'
);

describe('c-log', () => {
	it('reads last logs', () => {
		let receivedLogText: string = '';
		const logToStdout: LogToStdout = (logText) => {
			receivedLogText = logText;
		};

		execute(logToStdout, LOG_FILE);
		expect(receivedLogText).toBe(
			'This is a sample log\nJust including all the data'
		);
	});
});
