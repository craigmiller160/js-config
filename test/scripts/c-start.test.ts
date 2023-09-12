import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { runCommandAsync } from '../../scripts/utils/runCommand';
import { execute } from '../../scripts/c-start';
import { taskEither } from 'fp-ts';

const runCommandAsyncMock = runCommandAsync as MockedFunction<
	typeof runCommandAsync
>;

describe('c-start', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('starts vite dev server', () => {
		runCommandAsyncMock.mockReturnValue(taskEither.right(''));
		execute();
		expect(runCommandAsyncMock).toHaveBeenCalledWith('vite start');
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			'tsc --noEmit --watch'
		);
	});
});
