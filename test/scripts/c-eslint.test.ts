import { beforeEach, describe, expect, it, MockedFunction, vi, test } from 'vitest';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { either } from 'fp-ts';
import { execute } from '../../src/scripts/c-eslint';
import path from 'path';
import {ControlFile} from '../../src/scripts/files/ControlFile';

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
const CYPRESS_WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'eslintWithCypress'
);

type EslintPathArgs = Readonly<{
	directories: ControlFile['directories'],
	customPath: string | null;
}>;

test.each<EslintPathArgs>([
	{ directories: { test: false, cypress: false }, customPath: null },
	{ directories: { test: false, cypress: false }, customPath: '/foo/bar/abc.ts' },
	{ directories: { test: true, cypress: false }, customPath: null },
	{ directories: { test: false, cypress: true }, customPath: null },
	{ directories: { test: true, cypress: true }, customPath: null }
])('runs c-eslint for the directories $directories and with the custom path $customPath', () => {
	throw new Error();
});

describe('c-eslint', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		runCommandSyncMock.mockReturnValue(either.right(''));
	});

	it('runs with default path and no additional directories', () => {
		execute(process);
		expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${COMMAND} --fix --max-warnings=0 {src,test}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`,
			{
				env: {
					...process.env,
					ESLINT_USE_FLAT_CONFIG: 'true'
				}
			}
		);
	});

	it.fails('runs with default path and cypress directory');
	it.fails('runs with default path and test directory');
	it.fails('runs with default path and test and cypress directories');

	it('runs with default path and cypress', () => {
		execute({
			...process,
			cwd: () => CYPRESS_WORKING_DIR
		});
		expect(runCommandSyncMock).toHaveBeenCalledTimes(2);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${COMMAND} --fix --max-warnings=0 {src,test}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`
		);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			2,
			`${COMMAND} --fix --max-warnings=0 cypress/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`,
			{
				env: expect.objectContaining({
					NO_VITEST: 'true'
				}) as object
			}
		);
	});

	it('runs with explicit path', () => {
		const thePath = 'foo/bar.js';
		execute({
			...process,
			argv: ['', '', thePath]
		});
		expect(runCommandSyncMock).toHaveBeenCalledWith(
			`${COMMAND} --fix --max-warnings=0 ${thePath}`,
			{
				env: expect.objectContaining({
					NO_VITEST: 'false'
				}) as object
			}
		);
	});
});
