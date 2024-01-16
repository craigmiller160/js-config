import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { runCommandAsync } from '../../src/scripts/utils/runCommand';
import { execute } from '../../src/scripts/c-start';
import { taskEither, either } from 'fp-ts';
import path from 'path';
import { TSC, VITE } from '../../src/scripts/commandPaths';
import {
	ControlFile,
	parseControlFile
} from '../../src/scripts/files/ControlFile';

const runCommandAsyncMock = runCommandAsync as MockedFunction<
	typeof runCommandAsync
>;

const parseControlFileMock: MockedFunction<typeof parseControlFile> = vi.fn();
const controlFile: ControlFile = {
	directories: {
		test: false,
		cypress: false
	},
	eslintPlugins: {
		cypress: false,
		jestDom: false,
		react: false,
		vitest: false,
		tanstackQuery: false,
		testingLibraryReact: false
	},
	projectType: 'commonjs',
	workingDirectoryPath: ''
};

const VITE_CMD = path.join(process.cwd(), 'node_modules', VITE);
const TSC_CMD = path.join(process.cwd(), 'node_modules', TSC);
const CONFIG_CJS = path.join(process.cwd(), 'vite.config.mts');
const CONFIG_MJS = path.join(process.cwd(), 'vite.config.ts');

describe('c-start', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('starts vite dev server with esmodule type', () => {
		parseControlFileMock.mockReturnValue(
			either.right({
				...controlFile,
				projectType: 'module'
			})
		);
		runCommandAsyncMock.mockReturnValue(taskEither.right(''));
		execute(process, parseControlFileMock);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${VITE_CMD}  -c ${CONFIG_MJS}`
		);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${TSC_CMD} --noEmit --watch`
		);
	});

	it('starts vite dev server', () => {
		parseControlFileMock.mockReturnValue(either.right(controlFile));
		runCommandAsyncMock.mockReturnValue(taskEither.right(''));
		execute(process);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${VITE_CMD}  -c ${CONFIG_CJS}`
		);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${TSC_CMD} --noEmit --watch`
		);
	});

	it('starts dev server with arguments', () => {
		parseControlFileMock.mockReturnValue(either.right(controlFile));
		runCommandAsyncMock.mockReturnValue(taskEither.right(''));
		execute({
			...process,
			argv: ['', '', '--force']
		});
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${VITE_CMD} --force -c ${CONFIG_CJS}`
		);
		expect(runCommandAsyncMock).toHaveBeenCalledWith(
			`${TSC_CMD} --noEmit --watch`
		);
	});
});
