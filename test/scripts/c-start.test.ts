import { beforeEach, describe, it, MockedFunction, vi, expect } from 'vitest';
import { runCommandSync } from '../../scripts/utils/runCommand';
import { execute } from '../../scripts/c-start';
import { either } from 'fp-ts';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

describe('c-start', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it('starts vite dev server', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		execute();
		expect(runCommandSyncMock).toHaveBeenCalledWith('vite start');
		throw new Error('Needs to do dev server and tsc');
	});
});
