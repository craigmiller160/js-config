import path from 'path';
import fs from 'fs/promises';
import { logger } from './logger';
import { function as func, readonlyArray, taskEither, either } from 'fp-ts';
import { match, P } from 'ts-pattern';
import { walk } from './utils/files';
import { terminate } from './utils/terminate';
import { runCommandSync } from './utils/runCommand';
import { findCommand } from './utils/command';
import { TSC } from './commandPaths';
import { getRealArgs } from './utils/process';
import { createCompile } from './compile';
import {
	fixFileExtension,
	fixTypeFileExtensions
} from './compile/fileExtensions';

const SOURCE_RESOURCES = /^.*\.(css|scss|png|jpg|pem)$/;
const TYPE_RESOURCES = /^.*\.d\.(ts|mts|cts|tsx)$/;

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
		either.toError
	);

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
			}, either.toError)
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
				either.toError
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
