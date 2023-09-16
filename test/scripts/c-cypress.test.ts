import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import path from 'path';
import { CYPRESS } from '../../src/scripts/commandPaths';
import { either } from 'fp-ts';
import { execute } from '../../src/scripts/c-cypress';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const COMMAND = path.join(process.cwd(), 'node_modules', CYPRESS);

describe('c-cypress', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it('runs command', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		execute(process);

		expect(runCommandSyncMock).toHaveBeenCalledWith(
			`${COMMAND} run --component -b electron`
		);
	});
});
