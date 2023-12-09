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
import fs from 'fs';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'typeCheck'
);
const CONTROL_FILE = path.join(WORKING_DIR, 'control-file.json');
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

const deleteControlFile = () => {
	if (fs.existsSync(CONTROL_FILE)) {
		fs.rmSync(CONTROL_FILE);
	}
};

beforeEach(() => {
	deleteControlFile();
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
		fs.writeFileSync(CONTROL_FILE, JSON.stringify(controlFile));
		parseControlFileMock.mockReturnValue(either.right(controlFile));
		execute({
			process: {
				...process,
				cwd: () => WORKING_DIR
			},
			runCommandSync: runCommandSyncMock
		});

		expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${TSC} --noEmit --project ./node_modules/tsconfig.check.json`
		);
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
