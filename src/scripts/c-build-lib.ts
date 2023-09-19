import path from 'path';
import fs from 'fs/promises';
import { logger } from './logger';
import { runCommandSync } from './utils/runCommand';
import { function as func, either, taskEither } from 'fp-ts';
import { terminate } from './utils/terminate';
import { findCommand } from './utils/command';
import { SWC, TSC } from './commandPaths';
import { transformFile } from '@swc/core';
import { unknownToError } from './utils/unknownToError';
import { match } from 'ts-pattern';

type CompileType = 'ecmascript' | 'typescript';
type ModuleType = 'es6' | 'commonjs';

const SWCRC_CONFIG_DIR = path.join(__dirname, '..', '..', 'configs', 'swc');
const SWCRC_JS = path.join(SWCRC_CONFIG_DIR, '.swcrc_js');
const SWCRC_TS = path.join(SWCRC_CONFIG_DIR, '.swcrc_ts');

const getSwcConfigPath = (compileType: CompileType): string =>
	match(compileType)
		.with('ecmascript', () => SWCRC_JS)
		.with('typescript', () => SWCRC_TS)
		.exhaustive();

const createCompile =
	(srcDir: string, destDir: string) =>
	(file: string, compileType: CompileType, moduleType: ModuleType) => {
		const configFile = getSwcConfigPath(compileType);
		const parentDir = path.dirname(file);
		const relativePath = path.relative(srcDir, file);
		const outputPath = path.join(destDir, relativePath); // TODO fix file extensions for ts
		func.pipe(
			taskEither.tryCatch(
				() =>
					transformFile(file, {
						configFile,
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

export const execute = (process: NodeJS.Process) => {
	logger.info('Performing library build');
	const srcDir = path.join(process.cwd(), 'src');
	const destDir = path.join(process.cwd(), 'lib');
};
