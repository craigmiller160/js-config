import { runCommandSync as defaultRunCommandSync } from './utils/runCommand';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { terminate } from './utils/terminate';
import { either, function as func } from 'fp-ts';
import { findCommand } from './utils/command';
import { TSC } from './commandPaths';
import { parseControlFile } from './files/ControlFile';

const runRootTypeCheck = (
	process: NodeJS.Process,
	runCommandSync: typeof defaultRunCommandSync,
	command: string
): either.Either<Error, unknown> => {
	const testTsconfigPath = path.join(process.cwd(), 'test', 'tsconfig.json');
	if (fs.existsSync(testTsconfigPath)) {
		logger.debug('Using test tsconfig.json for type check');
		return runCommandSync(
			`${command} --noEmit --project ./test/tsconfig.json`
		);
	}

	logger.debug('Using base tsconfig.json for type check');
	return runCommandSync(`${command} --noEmit`);
};

const runCypressTypeCheck = (
	process: NodeJS.Process,
	runCommandSync: typeof defaultRunCommandSync,
	command: string
): either.Either<Error, unknown> => {
	const cypressTsconfigPath = path.join(
		process.cwd(),
		'cypress',
		'tsconfig.json'
	);
	if (fs.existsSync(cypressTsconfigPath)) {
		logger.debug('Cypress detected, performing cypress type check');
		return runCommandSync(
			`${command} --noEmit --project ./cypress/tsconfig.json`
		);
	}

	logger.debug('Cypress not present, skipping cypress type check');
	return either.right(func.constVoid());
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
		either.chainFirst(({ command }) =>
			runRootTypeCheck(process, runCommandSync, command)
		),
		either.chainFirst(({ command }) =>
			runCypressTypeCheck(process, runCommandSync, command)
		),
		either.fold(terminate, terminate)
	);
};
