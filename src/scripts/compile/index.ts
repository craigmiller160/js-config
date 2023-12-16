import { function as func, taskEither } from 'fp-ts';
import path from 'path';
import { transformFile } from '@swc/core';
import fs from 'fs/promises';
import { match, P } from 'ts-pattern';
import { getProjectRoot } from '../../root';
import { fixFileExtension } from './fileExtensions';

type ModuleType = 'es6' | 'commonjs';
type SwcConfigFileType = 'js' | 'ts';
type CompileType = 'ecmascript' | 'typescript' | 'none';
type CompileInfo = Readonly<{
	type: CompileType;
	config: string;
}>;

const SWCRC_JS = '.swcrc_js';
const SWCRC_TS = '.swcrc_ts';
const JS_FILE = /^.*\.(js|mjs|cjs|jsx)$/;
const TS_FILE = /^.*(?<!\.d)\.(ts|mts|cts|tsx)$/;

const getSwcConfigFile = (type: SwcConfigFileType): string => {
	const root = getProjectRoot();
	const configDir = path.join(root, 'configs', 'swc');
	return match(type)
		.with('js', () => path.join(configDir, SWCRC_JS))
		.with('ts', () => path.join(configDir, SWCRC_TS))
		.exhaustive();
};

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
	(file: string): taskEither.TaskEither<Error, string> => {
		const compileInfo = getSwcCompileInfo(file);
		if (compileInfo.type === 'none') {
			return taskEither.right('');
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
				either.toError
			),
			taskEither.chainFirst(() =>
				taskEither.tryCatch(
					() =>
						fs.mkdir(parentDir, {
							recursive: true
						}),
					either.toError
				)
			),
			taskEither.chain((output) =>
				taskEither.tryCatch(
					() => fs.writeFile(outputPath, output.code),
					either.toError
				)
			),
			taskEither.map(() => outputPath)
		);
	};
