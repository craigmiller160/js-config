import {
	afterEach,
	beforeEach,
	expect,
	MockedFunction,
	test,
	vi
} from 'vitest';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { either } from 'fp-ts';
import { execute } from '../../src/scripts/c-eslint';
import path from 'path';
import fs from 'fs/promises';
import { ControlFile } from '../../src/scripts/files/ControlFile';
import { match, P } from 'ts-pattern';
import { PackageJsonType } from '../../src/scripts/files/PackageJson';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const COMMAND = path.join(
	process.cwd(),
	'node_modules',
	'eslint',
	'bin',
	'eslint.js'
);

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'eslint'
);
const JS_CONFIG_DIR = path.join(
	WORKING_DIR,
	'node_modules',
	'@craigmiller160',
	'js-config'
);

type EslintPathArgs = Readonly<{
	projectType: PackageJsonType;
	directories: ControlFile['directories'];
	customPath: string | null;
}>;

const cleanDirectory = async () => {
	const files = await fs.readdir(JS_CONFIG_DIR);
	const promises = files
		.filter((file) => '.gitkeep' !== file && '.gitignore' !== file)
		.map((file) => fs.rm(path.join(JS_CONFIG_DIR, file)));
	await Promise.all(promises);
};

const writeControlFile = async (
	projectType: PackageJsonType,
	directories: ControlFile['directories']
) => {
	const controlFile: ControlFile = {
		directories,
		projectType,
		eslintPlugins: {
			cypress: false,
			testingLibraryReact: false,
			tanstackQuery: false,
			jestDom: false,
			vitest: false,
			react: false
		},
		workingDirectoryPath: WORKING_DIR
	};
	await fs.writeFile(
		path.join(WORKING_DIR, 'control-file.json'),
		JSON.stringify(controlFile, null, 2)
	);
};

beforeEach(async () => {
	vi.resetAllMocks();
	runCommandSyncMock.mockReturnValue(either.right(''));
	await cleanDirectory();
});

afterEach(async () => {
	await cleanDirectory();
});

test.each<EslintPathArgs>([
	{
		projectType: 'commonjs',
		directories: { test: false, cypress: false },
		customPath: null
	},
	{
		projectType: 'module',
		directories: { test: false, cypress: false },
		customPath: null
	},
	{
		projectType: 'commonjs',
		directories: { test: false, cypress: false },
		customPath: '/foo/bar/abc.ts'
	},
	{
		projectType: 'commonjs',
		directories: { test: true, cypress: false },
		customPath: null
	},
	{
		projectType: 'commonjs',
		directories: { test: false, cypress: true },
		customPath: null
	},
	{
		projectType: 'commonjs',
		directories: { test: true, cypress: true },
		customPath: null
	}
])(
	'runs c-eslint with project type $projectType for the directories $directories and with the custom path $customPath',
	async ({ projectType, directories, customPath }) => {
		await writeControlFile(projectType, directories);
		const rootDirs = [
			'src',
			directories.test ? 'test' : undefined,
			directories.cypress ? 'cypress' : undefined
		]
			.filter((dir): dir is string => !!dir)
			.join(',');

		const commonPath = '/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';

		const targetPath = match({
			customPath,
			multiDirectory: directories.cypress || directories.test
		})
			.with(
				{ customPath: P.nullish, multiDirectory: true },
				() => `{${rootDirs}}${commonPath}`
			)
			.with(
				{ customPath: P.nullish, multiDirectory: false },
				() => `${rootDirs}${commonPath}`
			)
			.otherwise(({ customPath }) => customPath);
		const configPath = path.join(WORKING_DIR, 'eslint.config.js');

		execute({
			...process,
			argv: ['', '', customPath].filter(
				(item): item is string => item !== null
			),
			cwd: () => WORKING_DIR
		});
		expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${COMMAND} --config ${configPath} --fix --max-warnings=0 ${targetPath}`,
			{
				env: {
					...process.env,
					ESLINT_USE_FLAT_CONFIG: 'true'
				}
			}
		);
	}
);
