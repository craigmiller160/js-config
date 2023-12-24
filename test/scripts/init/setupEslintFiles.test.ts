import { afterEach, beforeEach, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import {
	PackageJson,
	PackageJsonType
} from '../../../src/scripts/files/PackageJson';
import { ControlFile } from '../../../src/scripts/files/ControlFile';
import { function as func, readonlyArray, taskEither, either } from 'fp-ts';
import { taskEitherToPromiseCompatTask } from '../../../src/utils/taskEitherPromiseCompat';
import { setupEslintFiles } from '../../../src/scripts/init/setupEslintFiles';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'eslint_files'
);
const JS_CONFIG_DIR = path.join(
	WORKING_DIR,
	'node_modules',
	'@craigmiller160',
	'js-config'
);

const wipeWorkingDir = (): Promise<unknown> =>
	func.pipe(
		taskEither.tryCatch(() => fs.readdir(WORKING_DIR), either.toError),
		taskEither.map(
			func.flow(
				readonlyArray.filter(
					(fileName) =>
						fileName.includes('eslint') ||
						fileName.includes('prettier')
				),
				readonlyArray.map((fileName) =>
					path.join(WORKING_DIR, fileName)
				)
			)
		),
		taskEither.flatMap(
			func.flow(
				readonlyArray.map((filePath) =>
					taskEither.tryCatch(() => fs.rm(filePath), either.toError)
				),
				taskEither.sequenceArray
			)
		),
		taskEitherToPromiseCompatTask
	)();

type OutputFileType = 'eslint' | 'prettier';
const getOutputFiles = (type: OutputFileType): Promise<ReadonlyArray<string>> =>
	func.pipe(
		taskEither.tryCatch(() => fs.readdir(WORKING_DIR), either.toError),
		taskEither.map(
			readonlyArray.filter((fileName) => fileName.includes(type))
		),
		taskEitherToPromiseCompatTask
	)();

const writeControlFile = async (
	projectType: PackageJsonType
): Promise<void> => {
	const controlFile: ControlFile = {
		directories: {
			test: false,
			cypress: false
		},
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
		path.join(JS_CONFIG_DIR, 'control-file.json'),
		JSON.stringify(controlFile, null, 2)
	);
};

const createPackageJson = (projectType: PackageJsonType): PackageJson => ({
	type: projectType,
	name: '',
	version: '',
	dependencies: {},
	devDependencies: {}
});

type ExistingEslintFile = 'none' | 'legacy' | 'invalid' | 'valid';
type ExistingPrettierFile = 'none' | 'invalid' | 'valid';
type EslintFilesArgs = Readonly<{
	existingEslintFile: ExistingEslintFile;
	projectType: PackageJsonType;
}>;

type PrettierFilesArgs = Readonly<{
	existingPrettierFile: ExistingPrettierFile;
	projectType: PackageJsonType;
}>;

beforeEach(async () => {
	await wipeWorkingDir();
});

afterEach(async () => {
	await wipeWorkingDir();
});

test.each<EslintFilesArgs>([
	{ existingEslintFile: 'none', projectType: 'commonjs' },
	{ existingEslintFile: 'none', projectType: 'module' },
	{ existingEslintFile: 'legacy', projectType: 'commonjs' },
	{ existingEslintFile: 'invalid', projectType: 'commonjs' },
	{ existingEslintFile: 'valid', projectType: 'commonjs' }
])(
	'writes eslint file for project type $projectType with existing eslint file $existingEslintFile',
	async ({ projectType, existingEslintFile }) => {
		const packageJson = createPackageJson(projectType);
		await writeControlFile(projectType);

		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		const outputFiles = await getOutputFiles('eslint');
		expect(outputFiles).toHaveLength(existingEslintFile === 'none' ? 1 : 2);

		expect.fail('Finish this');
	}
);

test.each<PrettierFilesArgs>([
	{ existingPrettierFile: 'none', projectType: 'commonjs' },
	{ existingPrettierFile: 'none', projectType: 'module' },
	{ existingPrettierFile: 'invalid', projectType: 'commonjs' },
	{ existingPrettierFile: 'valid', projectType: 'commonjs' }
])(
	'writes prettier file for project type $projectType with existing prettier file $existingPrettierFile',
	async ({ projectType, existingPrettierFile }) => {
		const packageJson = createPackageJson(projectType);
		await writeControlFile(projectType);

		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		const outputFiles = await getOutputFiles('prettier');
		expect(outputFiles).toHaveLength(
			existingPrettierFile === 'none' ? 1 : 2
		);

		expect.fail('Finish this');
	}
);
