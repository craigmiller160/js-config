import { runCommandSync as defaultRunCommandSync } from './utils/runCommand';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { terminate } from './utils/terminate';
import { either, function as func } from 'fp-ts';
import { findCommand } from './utils/command';
import { TSC } from './commandPaths';
import { ControlFile, parseControlFile } from './files/ControlFile';
import { TsConfig, TsConfigCompilerOptions } from './files/TsConfig';
import { isLibraryPresent } from './utils/library';

const TESTING_LIBRARY_CYPRESS = '@testing-library/cypress';

const buildCheckTsConfig = (controlFile: ControlFile): TsConfig => {
	const hasTestingLibraryCypress = isLibraryPresent(TESTING_LIBRARY_CYPRESS);
	const compilerOptions: TsConfigCompilerOptions = controlFile.directories
		.cypress
		? {
				types: [
					'node',
					'cypress',
					hasTestingLibraryCypress
						? TESTING_LIBRARY_CYPRESS
						: undefined
				].flatMap((item) => (item ? [item] : []))
		  }
		: {};
	const checkTsConfig: TsConfig = {
		extends: '../tsconfig.json',
		compilerOptions: compilerOptions,
		include: [
			'../src/**/*',
			controlFile.directories.test ? '../test/**/*' : undefined,
			controlFile.directories.cypress ? '../cypress/**/*' : undefined
		].flatMap((item) => (item ? [item] : []))
	};
	return checkTsConfig;
};

const runTypeCheck = (
	process: NodeJS.Process,
	runCommandSync: typeof defaultRunCommandSync,
	command: string,
	controlFile: ControlFile
): either.Either<Error, string> => {
	const checkTsConfig = buildCheckTsConfig(controlFile);
	const checkTsConfigPath = path.join(
		process.cwd(),
		'node_modules',
		'tsconfig.check.json'
	);
	return func.pipe(
		either.tryCatch(
			() =>
				fs.writeFileSync(
					checkTsConfigPath,
					JSON.stringify(checkTsConfig, null, 2)
				),
			either.toError
		),
		either.chain(() =>
			runCommandSync(`${command} --noEmit --project ${checkTsConfigPath}`)
		)
	);
};

export type Dependencies = Readonly<{
	process: NodeJS.Process;
	runCommandSync: typeof defaultRunCommandSync;
}>;

export const execute = (
	dependencies: Dependencies = {
		process,
		runCommandSync: defaultRunCommandSync
	}
) => {
	const { process, runCommandSync } = dependencies;
	logger.info('Performing typescript type check');

	func.pipe(
		findCommand(process, TSC),
		either.bindTo('command'),
		either.bind('controlFile', () => parseControlFile(process)),
		either.chain(({ command, controlFile }) =>
			runTypeCheck(process, runCommandSync, command, controlFile)
		),
		either.fold(terminate, terminate)
	);
};
