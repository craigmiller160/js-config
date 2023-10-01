import { function as func, taskEither } from 'fp-ts';
import path from 'path';
import { transformFile } from '@swc/core';
import { unknownToError } from '../utils/unknownToError';
import fs from 'fs/promises';
import { match, P } from 'ts-pattern';
import baseFS from 'fs';

type ModuleType = 'es6' | 'commonjs';
type SwcConfigFileType = 'js' | 'ts';

const SWCRC_JS = '.swcrc_js';
const SWCRC_TS = '.swcrc_ts';
const JS_FILE = /^.*\.(js|mjs|cjs|jsx)$/;
const TS_FILE = /^.*(?<!\.d)\.(ts|mts|cts|tsx)$/;

const getSwcConfigFile = (type: SwcConfigFileType): string =>
	match({ type, srcExists: baseFS.existsSync(SWC_SRC_CONFIG_DIR) })
		.with({ type: 'js', srcExists: true }, () =>
			path.join(SWC_SRC_CONFIG_DIR, SWCRC_JS)
		)
		.with({ type: 'ts', srcExists: true }, () =>
			path.join(SWC_SRC_CONFIG_DIR, SWCRC_TS)
		)
		.with({ type: 'js', srcExists: false }, () =>
			path.join(SWC_BUILD_CONFIG_DIR, SWCRC_JS)
		)
		.with({ type: 'ts', srcExists: false }, () =>
			path.join(SWC_BUILD_CONFIG_DIR, SWCRC_TS)
		)
		.exhaustive();

const getSwcCompileInfo = (filePath: string): CompileInfo =>
	match<string, CompileInfo>(filePath)
		.with(P.string.regex(JS_FILE), () => ({
			type: 'ecmascript',
			config: getSwcConfigFile('js')
		}))
		.with(P.string.regex(TS_FILE), () => ({
			type: 'typescript',
			config: getSwcConfigFile('ts')
		}))
		.otherwise(() => ({
			type: 'none',
			config: ''
		}));

export const createCompile =
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
