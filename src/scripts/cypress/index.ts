import {
	readonlyArray,
	taskEither,
	task,
	taskOption,
	function as func,
	option
} from 'fp-ts';
import fs from 'fs/promises';

type CypressConfigType = 'js' | 'ts';
type CypressConfigFile = Readonly<{
	filename: string;
	type: CypressConfigType;
}>;

const CYPRESS_CONFIG_FILES: ReadonlyArray<CypressConfigFile> = [
	{ filename: 'cypress.config.ts', type: 'ts' },
	{ filename: 'cypress.config.mts', type: 'ts' },
	{ filename: 'cypress.config.cts', type: 'ts' },
	{ filename: 'cypress.config.js', type: 'js' },
	{ filename: 'cypress.config.mjs', type: 'js' },
	{ filename: 'cypress.config.cjs', type: 'js' }
];

const fileExists = (
	configFile: CypressConfigFile
): task.Task<CypressConfigFile | undefined> =>
	func.pipe(
		taskEither.tryCatch(() => fs.stat(configFile.filename), func.identity),
		taskEither.fold(
			() => async () => undefined,
			() => async () => configFile
		)
	);

const compileCypressConfigFile = (
	configFile: CypressConfigFile
): taskEither.TaskEither<Error, string> => {
	throw new Error();
};

export const compileAndGetCypressConfig = (): taskEither.TaskEither<
	Error,
	string
> =>
	func.pipe(
		CYPRESS_CONFIG_FILES,
		readonlyArray.map(fileExists),
		task.sequenceArray,
		taskOption.fromTask,
		taskOption.chainOptionK(readonlyArray.findFirst((result) => !!result)),
		taskOption.chainOptionK(option.fromNullable),
		taskEither.fromTaskOption(
			() => new Error('Could not find cypress config file')
		),
		taskEither.chain(compileCypressConfigFile)
	);
