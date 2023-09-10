import { describe, it, expect } from 'vitest';
import path from 'path';
import { execute, LogToStdout } from '../../scripts/c-log';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'log',
	'child'
);

describe('c-log', () => {
	it('reads last logs', () => {
		let receivedLogText: string = '';
		const logToStdout: LogToStdout = (logText) => {
			receivedLogText = logText;
		};

		execute(logToStdout, WORKING_DIR);
		expect(receivedLogText).toBe(
			'This is a sample log\nJust including all the data'
		);
	});
});
