import { afterEach, beforeEach, test, expect } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import {
	PackageJson,
	PackageJsonType
} from '../../../src/scripts/files/PackageJson';
import { ControlFile } from '../../../src/scripts/files/ControlFile';
import {
	function as func,
	readonlyArray,
	taskEither,
	either,
	string
} from 'fp-ts';
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
			func.flow(
				readonlyArray.filter((fileName) => fileName.includes(type)),
				readonlyArray.sort(string.Ord)
			)
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

const writeExistingPrettierFile = async (
	type: ExistingPrettierFile,
	projectType: PackageJsonType
): Promise<unknown> => {
	if (type === 'none') {
		return;
	}

	const extension = projectType === 'commonjs' ? 'js' : 'cjs';

	if (type === 'invalid') {
		await fs.writeFile(
			path.join(WORKING_DIR, `.prettierrc.${extension}`),
			`const foobar = 'hello'`
		);
	} else {
		await fs.writeFile(
			path.join(WORKING_DIR, `.prettierrc.${extension}`),
			`// Hello\nmodule.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	}
};

const writeExistingEslintFile = async (
	type: ExistingEslintFile,
	projectType: PackageJsonType
): Promise<unknown> => {
	if (type === 'none') {
		return;
	}

	const extension = projectType === 'commonjs' ? 'js' : 'cjs';

	if (type === 'invalid') {
		await fs.writeFile(
			path.join(WORKING_DIR, 'eslint.config.js'),
			`const foobar = 'hello'`
		);
	} else if (type === 'legacy') {
		await fs.writeFile(
			path.join(WORKING_DIR, `.eslintrc.${extension}`),
			`const foobar = 'hello'`
		);
	} else {
		await fs.writeFile(
			path.join(WORKING_DIR, 'eslint.config.js'),
			`// Hello\nmodule.exports = import('@craigmiller160/js-config/configs/eslint/eslint.config.mjs').then(
\t({ default: theDefault }) => theDefault
);`
		);
	}
};

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
		await Promise.all([
			writeControlFile(projectType),
			writeExistingEslintFile(existingEslintFile, projectType)
		]);

		const result = await setupEslintFiles(WORKING_DIR, packageJson)();
		expect(result).toBeRight();

		const outputFiles = await getOutputFiles('eslint');
		const hasBackupFile = ['invalid', 'legacy'].includes(
			existingEslintFile
		);
		expect(outputFiles).toHaveLength(hasBackupFile ? 2 : 1);
		if (hasBackupFile && existingEslintFile === 'legacy') {
			expect(outputFiles[0]).toBe('.eslintrc_backup');
		} else if (hasBackupFile) {
			expect(outputFiles[0]).toBe('eslint.config_backup');
		}

		const eslintConfigFile = outputFiles[hasBackupFile ? 1 : 0];
		const config = await fs.readFile(
			path.join(WORKING_DIR, eslintConfigFile),
			'utf8'
		);

		const validPrefix = existingEslintFile === 'valid' ? '// Hello\n' : '';
		expect(config)
			.toBe(`${validPrefix}module.exports = import('@craigmiller160/js-config/configs/eslint/eslint.config.mjs').then(
\t({ default: theDefault }) => theDefault
);\n`);
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
		await Promise.all([
			writeControlFile(projectType),
			writeExistingPrettierFile(existingPrettierFile, projectType)
		]);

		const result = await setupEslintFiles(WORKING_DIR, packageJson)();
		expect(result).toBeRight();

		const outputFiles = await getOutputFiles('prettier');
		const hasBackupFile = existingPrettierFile === 'invalid';
		expect(outputFiles).toHaveLength(hasBackupFile ? 2 : 1);
		if (hasBackupFile) {
			expect(outputFiles[0]).toBe('.prettierrc_backup');
		}

		const prettierConfigFile = outputFiles[hasBackupFile ? 1 : 0];
		const config = await fs.readFile(
			path.join(WORKING_DIR, prettierConfigFile),
			'utf8'
		);
		const validPrefix =
			existingPrettierFile === 'valid' ? '// Hello\n' : '';
		expect(config).toBe(
			`${validPrefix}module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	}
);
