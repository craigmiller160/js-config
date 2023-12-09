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

const notUndefined = (item: string | undefined): item is string => !!item;

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
			].filter(notUndefined)
		};
		expect(tsConfigEither).toEqualRight(expectedTsConfig);
	}
);
