import { beforeEach, expect, MockedFunction, test, vi } from 'vitest';
import path from 'path';
import { execute } from '../../src/scripts/c-type-check';
import { either } from 'fp-ts';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import {
	ControlFile,
	parseControlFile
} from '../../src/scripts/files/ControlFile';
import fs from 'fs';
import { parseTsConfig, TsConfig } from '../../src/scripts/files/TsConfig';

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
			eslintPlugins: {
				cypress: false,
				testingLibraryReact: false,
				tanstackQuery: false,
				jestDom: false,
				vitest: false,
				react: false
			},
			directories: {
				test: additionalDirectories.includes('test'),
				cypress: additionalDirectories.includes('cypress')
			}
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

		const tsConfigPath = path.join(
			WORKING_DIR,
			'node_modules',
			'tsconfig.check.json'
		);

		expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${TSC} --noEmit --project ${tsConfigPath}`
		);
		const tsConfigEither = parseTsConfig(
			path.join(WORKING_DIR, 'node_modules', 'tsconfig.check.json')
		);
		const expectedTsConfig: TsConfig = {
			extends: '../tsconfig.json',
			include: [
				'../src/**/*',
				additionalDirectories.includes('test')
					? '../test/**/*'
					: undefined,
				additionalDirectories.includes('cypress')
					? '../cypress/**/*'
					: undefined
			].flatMap((item) => (item ? [item] : []))
		};
		expect(tsConfigEither).toEqualRight(expectedTsConfig);
	}
);
