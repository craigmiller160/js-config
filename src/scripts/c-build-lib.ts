import path from 'path';
import fs from 'fs/promises';
import { logger } from './logger';
import { function as func, readonlyArray, taskEither, either } from 'fp-ts';
import { transformFile } from '@swc/core';
import { unknownToError } from './utils/unknownToError';
import { match, P } from 'ts-pattern';
import { walk } from './utils/files';
import { terminate } from './utils/terminate';
import { runCommandSync } from './utils/runCommand';
import { findCommand } from './utils/command';
import { TSC } from './commandPaths';

type CompileType = 'ecmascript' | 'typescript' | 'none';
type ModuleType = 'es6' | 'commonjs';
type CompileInfo = Readonly<{
	type: CompileType;
	config: string;
}>;

const SWCRC_CONFIG_DIR = path.join(__dirname, '..', '..', 'configs', 'swc');
const SWCRC_JS = path.join(SWCRC_CONFIG_DIR, '.swcrc_js');
const SWCRC_TS = path.join(SWCRC_CONFIG_DIR, '.swcrc_ts');
const JS_FILE = /^.*\.(js|mjs|cjs|jsx)$/;
const TS_FILE = /^.*(?<!\.d)\.(ts|mts|cts|tsx)$/;
const SOURCE_RESOURCES = /^.*\.(css|scss|png|jpg)$/;
const TYPE_RESOURCES = /^.*\.d\.(ts|mts|cts|tsx)$/;

const getSwcCompileInfo = (filePath: string): CompileInfo =>
	match<string, CompileInfo>(filePath)
		.with(P.string.regex(JS_FILE), () => ({
			type: 'ecmascript',
			config: SWCRC_JS
		}))
		.with(P.string.regex(TS_FILE), () => ({
			type: 'typescript',
			config: SWCRC_TS
		}))
		.otherwise(() => ({
			type: 'none',
			config: ''
		}));

const fixFileExtension = (filePath: string): string => {
	const originalExtension = path.extname(filePath);
	const newExtension = match(originalExtension)
		.with('.ts', () => '.js')
		.with('.mts', () => '.mjs')
		.with('.cts', () => '.cjs')
		.with('.tsx', () => '.jsx')
		.otherwise(() => originalExtension);
	const filePathWithoutExtension = filePath.replace(/\..*$/, '');
	return `${filePathWithoutExtension}${newExtension}`;
};

const createCompile =
	(srcDir: string, destDir: string, moduleType: ModuleType) =>
	(file: string): taskEither.TaskEither<Error, unknown> => {
		const compileInfo = getSwcCompileInfo(file);
		if (compileInfo.type === 'none') {
			return taskEither.right(func.constVoid());
		}
		const outputPath = func.pipe(
			path.relative(srcDir, file),
			(relativePath) => path.join(destDir, relativePath),
			fixFileExtension
		);
		const parentDir = path.dirname(outputPath);
		return func.pipe(
			taskEither.tryCatch(
				() =>
					transformFile(file, {
						configFile: compileInfo.config,
						module: {
							type: moduleType
						}
					}),
				unknownToError
			),
			taskEither.chainFirst(() =>
				taskEither.tryCatch(
					() =>
						fs.mkdir(parentDir, {
							recursive: true
						}),
					unknownToError
				)
			),
			taskEither.chain((output) =>
				taskEither.tryCatch(
					() => fs.writeFile(outputPath, output.code),
					unknownToError
				)
			)
		);
	};

const compileFiles =
	(compileFn: (file: string) => taskEither.TaskEither<Error, unknown>) =>
	(files: ReadonlyArray<string>): taskEither.TaskEither<Error, unknown> =>
		func.pipe(
			files,
			readonlyArray.map(compileFn),
			taskEither.sequenceArray
		);

const generateTypes = (
	process: NodeJS.Process,
	destDir: string
): either.Either<Error, unknown> =>
	func.pipe(
		findCommand(process, TSC),
		either.chain((command) =>
			runCommandSync(
				`${command} --declaration --emitDeclarationOnly --outDir ${destDir}`
			)
		)
	);

const copyFile = async (
	file: string,
	srcDir: string,
	destDir: string
): Promise<unknown> => {
	const outputPath = func.pipe(
		path.relative(srcDir, file),
		(relativePath) => path.join(destDir, relativePath),
		fixFileExtension
	);
	const parentDir = path.dirname(outputPath);
	await fs.mkdir(parentDir, {
		recursive: true
	});
	return fs.copyFile(file, outputPath);
};

type FileCopyType = 'source' | 'type' | 'none';
type FileCopyInfo = Readonly<{
	type: FileCopyType;
	file: string;
}>;

const getFileCopyInfo = (file: string): FileCopyInfo =>
	match<string, FileCopyInfo>(file)
		.when(SOURCE_RESOURCES.test, () => ({
			type: 'source',
			file
		}))
		.when(TYPE_RESOURCES.test, () => ({
			type: 'type',
			file
		}))
		.otherwise(() => ({
			type: 'none',
			file
		}));

const copyResources = (
	files: ReadonlyArray<string>,
	srcDir: string,
	destEsmDir: string,
	destCjsDir: string,
	destTypesDir: string
): Promise<unknown> => {
	const promises = func.pipe(
		files,
		readonlyArray.map(getFileCopyInfo),
		readonlyArray.map((info) =>
			match(info)
				.with({ type: 'source' }, () =>
					Promise.all([
						copyFile(info.file, srcDir, destEsmDir),
						copyFile(info.file, srcDir, destCjsDir)
					])
				)
				.with({ type: 'type' }, () =>
					copyFile(info.file, srcDir, destTypesDir)
				)
				.otherwise(() => Promise.resolve())
		)
	);
	return Promise.all(promises);
};

export const execute = async (process: NodeJS.Process) => {
	logger.info('Performing library build');
	const srcDir = path.join(process.cwd(), 'src');
	const destDir = path.join(process.cwd(), 'lib');
	const destEsmDir = path.join(destDir, 'esm');
	const destCjsDir = path.join(destDir, 'cjs');
	const destTypesDir = path.join(destDir, 'types');

	const esmCompile = createCompile(srcDir, destEsmDir, 'es6');
	const cjsCompile = createCompile(srcDir, destCjsDir, 'commonjs');

	const files = await walk(srcDir);

	await func.pipe(
		taskEither.right(files),
		taskEither.chainFirst(compileFiles(esmCompile)),
		taskEither.chainFirst(compileFiles(cjsCompile)),
		taskEither.chainEitherK(() => generateTypes(process, destTypesDir)),
		taskEither.chain(() =>
			taskEither.tryCatch(
				() =>
					copyResources(
						files,
						srcDir,
						destEsmDir,
						destCjsDir,
						destTypesDir
					),
				unknownToError
			)
		),
		taskEither.fold(
			(ex) => () => {
				terminate(ex);
				return Promise.resolve();
			},
			() => () => {
				terminate('');
				return Promise.resolve();
			}
		)
	)();
};
