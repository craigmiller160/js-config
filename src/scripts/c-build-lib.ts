import path from 'path';
import fs from 'fs/promises';
import { logger } from './logger';
import { function as func, readonlyArray, taskEither, either } from 'fp-ts';
import { transformFile } from '@swc/core';
import { unknownToError } from './utils/unknownToError';
import { match } from 'ts-pattern';
import { walk } from './utils/files';
import { terminate } from './utils/terminate';

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

const getSwcCompileInfo = (filePath: string): CompileInfo =>
	match<string, CompileInfo>(filePath)
		.when(JS_FILE.test, () => ({
			type: 'ecmascript',
			config: SWCRC_JS
		}))
		.when(TS_FILE.test, () => ({
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
		const parentDir = path.dirname(file);
		const outputPath = func.pipe(
			path.relative(srcDir, file),
			(relativePath) => path.join(destDir, relativePath),
			fixFileExtension
		);
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

const generateTypes = (destDir: string): either.Either<Error, unknown> => {
	throw new Error();
};

export const execute = (process: NodeJS.Process) => {
	logger.info('Performing library build');
	const srcDir = path.join(process.cwd(), 'src');
	const destDir = path.join(process.cwd(), 'lib');
	const destEsmDir = path.join(destDir, 'esm');
	const destCjsDir = path.join(destDir, 'cjs');
	const destTypesDir = path.join(destDir, 'types');

	const esmCompile = createCompile(srcDir, destEsmDir, 'es6');
	const cjsCompile = createCompile(srcDir, destCjsDir, 'commonjs');
	func.pipe(
		() => walk(srcDir),
		taskEither.fromTask,
		taskEither.chainFirst(compileFiles(esmCompile)),
		taskEither.chainFirst(compileFiles(cjsCompile)),
		taskEither.chainEitherK(() => generateTypes(destTypesDir)),
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
