import { readonlyArray, taskEither, task, taskOption, func } from 'fp-ts';
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
): taskOption.TaskOption<CypressConfigFile> =>
	func.pipe(
		taskOption.tryCatch(() => fs.stat(configFile.filename)),
		taskOption.map(() => configFile)
	);

export const compileAndGetCypressConfig = () => {
	func.pipe(CYPRESS_CONFIG_FILES, readonlyArray.map(fileExists));
};
