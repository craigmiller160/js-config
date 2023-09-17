import { beforeEach, describe, it, MockedFunction, vi, expect } from 'vitest';
import path from 'path';
import { CYPRESS } from '../../src/scripts/commandPaths';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { either } from 'fp-ts';
import { execute } from '../../src/scripts/c-cypress-dev';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const COMMAND = path.join(process.cwd(), 'node_modules', CYPRESS);

describe('c-cypress-dev', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it('runs command', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		execute(process);

		expect(runCommandSyncMock).toHaveBeenCalledWith(`${COMMAND} open`);
	});
});
