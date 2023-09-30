import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { runCommandAsync } from '../../src/scripts/utils/runCommand';
import { execute } from '../../src/scripts/c-start';
import { taskEither } from 'fp-ts';
import path from 'path';
import { TSC, VITE } from '../../src/scripts/commandPaths';

const runCommandAsyncMock = runCommandAsync as MockedFunction<
	typeof runCommandAsync
>;

const VITE_CMD = path.join(process.cwd(), 'node_modules', VITE);
const TSC_CMD = path.join(process.cwd(), 'node_modules', TSC);
const CONFIG = path.join(process.cwd(), 'vite.config.mts');

describe('c-start', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('starts vite dev server', () => {
		runCommandAsyncMock.mockReturnValue(taskEither.right(''));
		execute(process);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${VITE_CMD} start  -c ${CONFIG}`
		);
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
			`${VITE_CMD} start --force -c ${CONFIG}`
		);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${TSC_CMD} --noEmit --watch`
		);
	});
});
