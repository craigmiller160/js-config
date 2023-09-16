import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { runCommandAsync } from '../../scripts/utils/runCommand';
import { execute } from '../../scripts/c-start';
import { taskEither } from 'fp-ts';
import path from 'path';
import { TSC, VITE } from '../../scripts/commandPaths';

const runCommandAsyncMock = runCommandAsync as MockedFunction<
	typeof runCommandAsync
>;

const VITE_CMD = path.join(process.cwd(), 'node_modules', VITE);
const TSC_CMD = path.join(process.cwd(), 'node_modules', TSC);

describe('c-start', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('starts vite dev server', () => {
		runCommandAsyncMock.mockReturnValue(taskEither.right(''));
		execute(process);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(`${VITE_CMD} start`);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${TSC_CMD} --noEmit --watch`
		);
	});

	it('starts dev server with arguments', () => {
		runCommandAsyncMock.mockReturnValue(taskEither.right(''));
		execute({
			...process,
			argv: ['', '', '--force']
		});
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${VITE_CMD} start --force`
		);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${TSC_CMD} --noEmit --watch`
		);
	});
});
