import path from 'path';
import fs from 'fs/promises';
import baseFS from 'fs';
import { logger } from './logger';
import { function as func, readonlyArray, taskEither, either } from 'fp-ts';
import { unknownToError } from './utils/unknownToError';
import { match, P } from 'ts-pattern';
import { walk } from './utils/files';
import { terminate } from './utils/terminate';
import { runCommandSync } from './utils/runCommand';
import { findCommand } from './utils/command';
import { TSC } from './commandPaths';
import { getRealArgs } from './utils/process';
import { createCompile } from './compile';

type CompileType = 'ecmascript' | 'typescript' | 'none';
type CompileInfo = Readonly<{
	type: CompileType;
	config: string;
}>;

const SWC_SRC_CONFIG_DIR = path.join(__dirname, '..', '..', 'configs', 'swc');
const SWC_BUILD_CONFIG_DIR = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'configs',
	'swc'
);

const SOURCE_RESOURCES = /^.*\.(css|scss|png|jpg|pem)$/;
const TYPE_RESOURCES = /^.*\.d\.(ts|mts|cts|tsx)$/;
const EXTENSION = /\.[^/.]+$/;


const fixFileExtension = (filePath: string): string => {
	const filePathWithoutExtension = filePath.replace(EXTENSION, '');
	if (
		filePath.endsWith('.d.ts') ||
		filePath.endsWith('.d.mts') ||
		filePath.endsWith('.d.cts')
	) {
		return `${filePathWithoutExtension}.ts`;
	}
	const originalExtension = path.extname(filePath);
	const newExtension = match(originalExtension)
		.with(
			P.union('.ts', '.mts', '.cts', '.js', '.cjs', '.mjs'),
			() => '.js'
		)
		.with(P.union('.tsx', '.jsx'), () => '.jsx')
		.otherwise(() => originalExtension);
	return `${filePathWithoutExtension}${newExtension}`;
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
): either.Either<Error, unknown> => {
	logger.debug('Generating type declarations');
	return func.pipe(
		findCommand(process, TSC),
		either.chain((command) =>
			runCommandSync(
				`${command} --declaration --emitDeclarationOnly --outDir ${destDir}`,
				{
					cwd: process.cwd()
				}
			)
		)
	);
};

const copyFile = async (
	file: string,
	srcDir: string,
	destDir: string,
	doExecute: boolean
): Promise<unknown> => {
	if (!doExecute) {
		return Promise.resolve();
	}
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
		.with(P.string.regex(SOURCE_RESOURCES), () => ({
			type: 'source',
			file
		}))
		.with(P.string.regex(TYPE_RESOURCES), () => ({
			type: 'type',
			file
		}))
		.otherwise(() => ({
			type: 'none',
			file
		}));

const copyResources = (
	compileOutputType: CompileOutputType,
	files: ReadonlyArray<string>,
	srcDir: string,
	destEsmDir: string,
	destCjsDir: string,
	destTypesDir: string
): Promise<unknown> => {
	logger.debug('Copying resources & custom type declaration files');
	const promises = func.pipe(
		files,
		readonlyArray.map(getFileCopyInfo),
		readonlyArray.map((info) =>
			match(info)
				.with({ type: 'source' }, () =>
					Promise.all([
						copyFile(
							info.file,
							srcDir,
							destEsmDir,
							compileOutputType !== 'cjs'
						),
						copyFile(
							info.file,
							srcDir,
							destCjsDir,
							compileOutputType !== 'esm'
						)
					])
				)
				.with({ type: 'type' }, () =>
					copyFile(info.file, srcDir, destTypesDir, true)
				)
				.otherwise(() => Promise.resolve())
		)
	);
	return Promise.all(promises);
};

type CompileOutputType = 'esm' | 'cjs' | 'both';
type CompileFunctions = Readonly<{
	type: CompileOutputType;
	esmCompile: (file: string) => taskEither.TaskEither<Error, unknown>;
	cjsCompile: (file: string) => taskEither.TaskEither<Error, unknown>;
}>;

const getCompileFunctions = (
	args: ReadonlyArray<string>,
	srcDir: string,
	destEsmDir: string,
	destCjsDir: string
): CompileFunctions => {
	const esmCompile = createCompile(srcDir, destEsmDir, 'es6');
	const cjsCompile = createCompile(srcDir, destCjsDir, 'commonjs');
	const noop = () => taskEither.right(func.constVoid());
	return match<ReadonlyArray<string>, CompileFunctions>(args)
		.with([], () => ({
			type: 'both',
			esmCompile,
			cjsCompile
		}))
		.with(P.array('-e'), () => ({
			type: 'esm',
			esmCompile,
			cjsCompile: noop
		}))
		.with(P.array('-c'), () => ({
			type: 'cjs',
			esmCompile: noop,
			cjsCompile
		}))
		.otherwise(() => ({
			type: 'both',
			esmCompile,
			cjsCompile
		}));
};

const removeDestDir = (
	destDir: string
): taskEither.TaskEither<Error, unknown> =>
	taskEither.tryCatch(
		() =>
			fs.rm(destDir, {
				recursive: true,
				force: true
			}),
		unknownToError
	);

const fixTypeFileExtensions = (
	typesDir: string
): taskEither.TaskEither<Error, unknown> => {
	logger.debug('Fixing type declaration file extensions');
	return func.pipe(
		taskEither.tryCatch(() => walk(typesDir), unknownToError),
		taskEither.map((files) =>
			files.filter(
				(file) => file.endsWith('.mts') || file.endsWith('.cts')
			)
		),
		taskEither.chain(
			func.flow(
				readonlyArray.map((file) => {
					const newFile = `${file.replace(EXTENSION, '')}.ts`;
					return taskEither.tryCatch(
						() => fs.rename(file, newFile),
						unknownToError
					);
				}),
				taskEither.sequenceArray
			)
		)
	);
};

export const execute = (process: NodeJS.Process): Promise<unknown> => {
	const args = getRealArgs(process);
	logger.info('Performing library build');
	const srcDir = path.join(process.cwd(), 'src');
	const destDir = path.join(process.cwd(), 'lib');
	const destEsmDir = path.join(destDir, 'esm');
	const destCjsDir = path.join(destDir, 'cjs');
	const destTypesDir = path.join(destDir, 'types');

	const {
		esmCompile,
		cjsCompile,
		type: compileOutputType
	} = getCompileFunctions(args, srcDir, destEsmDir, destCjsDir);
	logger.debug(`Library compilation module type: ${compileOutputType}`);

	return func.pipe(
		removeDestDir(destDir),
		taskEither.chain(() =>
			taskEither.tryCatch(() => {
				logger.debug('Identifying all files in source directory');
				return walk(srcDir);
			}, unknownToError)
		),
		taskEither.map((files) => {
			logger.debug('Compiling esm files, if necessary');
			return files;
		}),
		taskEither.chainFirst(compileFiles(esmCompile)),
		taskEither.map((files) => {
			logger.debug('Compiling cjs files, if necessary');
			return files;
		}),
		taskEither.chainFirst(compileFiles(cjsCompile)),
		taskEither.chainFirstEitherK(() =>
			generateTypes(process, destTypesDir)
		),
		taskEither.chain((files) =>
			taskEither.tryCatch(
				() =>
					copyResources(
						compileOutputType,
						files,
						srcDir,
						destEsmDir,
						destCjsDir,
						destTypesDir
					),
				unknownToError
			)
		),
		taskEither.chain(() => fixTypeFileExtensions(destTypesDir)),
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
