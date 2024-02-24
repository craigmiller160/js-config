import { beforeEach, expect, MockedFunction, vi, test } from 'vitest';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { execute } from '../../src/scripts/c-validate';
import { either } from 'fp-ts';
import {
	parseControlFile,
	ControlFile
} from '../../src/scripts/files/ControlFile';
import { match, P } from 'ts-pattern';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const parseControlFileMock: MockedFunction<typeof parseControlFile> = vi.fn();

beforeEach(() => {
	vi.resetAllMocks();
});

test.each<Pick<ControlFile, 'directories'>>([
	{ directories: { test: false, cypress: false } }
])('c-validate with $directories', ({ directories }) => {
	const controlFile: ControlFile = {
		directories,
		workingDirectoryPath: '',
		projectType: 'module',
		eslintPlugins: {
			cypress: false,
			vitest: false,
			jestDom: false,
			tanstackQuery: false,
			testingLibraryReact: false,
			react: false
		}
	};
	parseControlFileMock.mockReturnValue(either.right(controlFile));
	execute(process, parseControlFileMock);

	const numberOfCalls = match(directories)
		.with({ test: false, cypress: false }, () => 3)
		.with(
			P.union(
				{ test: true, cypress: false },
				{ test: false, cypress: true }
			),
			() => 4
		)
		.with({ test: true, cypress: true }, () => 5)
		.exhaustive();

	expect(runCommandSyncMock).toHaveBeenCalledTimes(numberOfCalls);
	expect(runCommandSyncMock).toHaveBeenNthCalledWith(1, 'c-type-check');
	expect(runCommandSyncMock).toHaveBeenNthCalledWith(2, 'c-eslint');
	expect(runCommandSyncMock).toHaveBeenNthCalledWith(3, 'c-stylelint');

	let callCounter = 3;
	if (directories.test) {
		callCounter++;
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			callCounter,
			'c-test'
		);
	}

	if (directories.cypress) {
		callCounter++;
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			callCounter,
			'c-cypress'
		);
	}
});
