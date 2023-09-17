import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import path from 'path';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { execute } from '../../src/scripts/c-validate';
import { either } from 'fp-ts';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'validate'
);

describe('c-validate', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('runs for project without cypress', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		const cwd = path.join(WORKING_DIR, 'base');
		execute({
			...process,
			cwd: () => cwd
		});

		expect(runCommandSyncMock).toHaveBeenCalledTimes(4);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(1, 'c-type-check');
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(2, 'c-eslint');
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(3, 'c-stylelint');
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(4, 'c-test');
	});

	it('runs for project with cypress', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		const cwd = path.join(WORKING_DIR, 'withCypress');
		execute({
			...process,
			cwd: () => cwd
		});

		expect(runCommandSyncMock).toHaveBeenCalledTimes(5);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(1, 'c-type-check');
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(2, 'c-eslint');
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(3, 'c-stylelint');
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(4, 'c-test');
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(5, 'c-cypress');
	});
});
