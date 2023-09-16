import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { execute } from '../../src/scripts/c-stylelint';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { either } from 'fp-ts';
import path from 'path';
import { STYLELINT } from '../../src/scripts/commandPaths';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const STYLELINT_PATH = path.join(process.cwd(), 'node_modules', STYLELINT);

describe('c-stylelint', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('runs command for all files', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		execute(process);

		expect(runCommandSyncMock).toHaveBeenCalledWith(
			`${STYLELINT_PATH} --fix --max-warnings=0 src/**/*.{css,scss}`
		);
	});

	it('runs command for single file', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		execute({
			...process,
			argv: ['', '', 'src/foo.scss']
		});

		expect(runCommandSyncMock).toHaveBeenCalledWith(
			`${STYLELINT_PATH} --fix --max-warnings=0 src/foo.scss`
		);
	});
});
