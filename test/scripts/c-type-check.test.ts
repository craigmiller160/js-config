import {
	beforeEach,
	describe,
	it,
	MockedFunction,
	vi,
	expect,
	test
} from 'vitest';
import path from 'path';
import { execute } from '../../src/scripts/c-type-check';
import { either } from 'fp-ts';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import {
	ControlFile,
	parseControlFile
} from '../../src/scripts/files/ControlFile';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'typeCheck'
);
const TSC = path.join(
	process.cwd(),
	'node_modules',
	'typescript',
	'bin',
	'tsc'
);

const runCommandSyncMock: MockedFunction<typeof runCommandSync> = vi.fn();
const parseControlFileMock: MockedFunction<typeof parseControlFile> = vi.fn();

type TypeCheckAdditionalDirectory = 'test' | 'cypress';
type TypeCheckTestParams = Readonly<{
	additionalDirectories: ReadonlyArray<TypeCheckAdditionalDirectory>;
}>;

beforeEach(() => {
	vi.resetAllMocks();
	runCommandSyncMock.mockReturnValue(either.right(''));
});

test.each<TypeCheckTestParams>([
	{ additionalDirectories: [] },
	{ additionalDirectories: ['test'] },
	{ additionalDirectories: ['cypress'] },
	{ additionalDirectories: ['test', 'cypress'] }
])(
	'c-type-check with additional directories $additionalDirectories',
	({ additionalDirectories }) => {
		const controlFile: ControlFile = {
			workingDirectoryPath: '',
			projectType: 'module',
			eslintPlugins: [],
			hasTestDirectory: additionalDirectories.includes('test'),
			hasCypressDirectory: additionalDirectories.includes('cypress')
		};
		parseControlFileMock.mockReturnValue(either.right(controlFile));
		execute({
			process: {
				...process,
				cwd: () => cwd
			},
			runCommandSync: runCommandSyncMock,
			parseControlFile: parseControlFileMock
		});

		expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
		// TODO need to validate what was done for the command
	}
);

describe('c-type-check', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		runCommandSyncMock.mockReturnValue(either.right(''));
	});

	it('runs the base type check only', () => {
		const cwd = path.join(WORKING_DIR, 'baseOnly');
		execute({
			...process,
			cwd: () => cwd
		});
		expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${TSC} --noEmit`
		);
	});

	it('runs the type check once using the test config', () => {
		const cwd = path.join(WORKING_DIR, 'testOnly');
		execute({
			...process,
			cwd: () => cwd
		});
		expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${TSC} --noEmit --project ./test/tsconfig.json`
		);
	});

	it('runs the type check twice, using the base config and cypress config', () => {
		const cwd = path.join(WORKING_DIR, 'baseAndCypress');
		execute({
			...process,
			cwd: () => cwd
		});
		expect(runCommandSyncMock).toHaveBeenCalledTimes(2);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${TSC} --noEmit`
		);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			2,
			`${TSC} --noEmit --project ./cypress/tsconfig.json`
		);
	});
});
