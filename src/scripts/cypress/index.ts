import {
	readonlyArray,
	taskEither,
	task,
	taskOption,
	function as func,
	option
} from 'fp-ts';
import fs from 'fs/promises';
import path from 'path';
import { createCompile } from '../compile';

const CYPRESS_CONFIG_FILES: ReadonlyArray<string> = [
	'cypress.config.ts',
	'cypress.config.mts',
	'cypress.config.cts',
	'cypress.config.js',
	'cypress.config.mjs',
	'cypress.config.cjs'
];

const fileExists =
	(process: NodeJS.Process) =>
	(configFile: string): task.Task<string | undefined> => {
		const configFilePath = path.join(process.cwd(), configFile);
		return func.pipe(
			taskEither.tryCatch(() => fs.stat(configFilePath), func.identity),
			taskEither.fold(
				() => async () => undefined,
				() => async () => configFile
			)
		);
	};

const compileCypressConfigFile =
	(process: NodeJS.Process) =>
	(configFile: string): taskEither.TaskEither<Error, string> => {
		const destDir = path.join(process.cwd(), 'node_modules');
		const file = path.join(process.cwd(), configFile);
		return createCompile(process.cwd(), destDir, 'commonjs')(file);
	};

export const compileAndGetCypressConfig = (
	process: NodeJS.Process
): taskEither.TaskEither<Error, string> =>
	func.pipe(
		CYPRESS_CONFIG_FILES,
		readonlyArray.map(fileExists(process)),
		task.sequenceArray,
		taskOption.fromTask,
		taskOption.chainOptionK(readonlyArray.findFirst((result) => !!result)),
		taskOption.chainOptionK(option.fromNullable),
		taskEither.fromTaskOption(
			() => new Error('Could not find cypress config file')
		),
		taskEither.chain(compileCypressConfigFile(process))
	);
