import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { runCommandSync } from '../../scripts/utils/runCommand';
import { either } from 'fp-ts';
import { execute } from '../../scripts/c-eslint';
import path from 'path';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const COMMAND = path.join(
	process.cwd(),
	'node_modules',
	'eslint',
	'bin',
	'eslint.js'
);

describe('c-lint', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		runCommandSyncMock.mockReturnValue(either.right(''));
	});

	it('runs with default path', () => {
		execute(process);
		expect(runCommandSync).toHaveBeenCalledWith(
			`${COMMAND} --fix --max-warnings=0 {src,test,cypress}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`
		);
	});

	it('runs with explicit path', () => {
		const thePath = 'foo/bar.js';
		execute({
			...process,
			argv: ['', '', thePath]
		});
		expect(runCommandSync).toHaveBeenCalledWith(
			`${COMMAND} --fix --max-warnings=0 ${thePath}`
		);
	});
});
