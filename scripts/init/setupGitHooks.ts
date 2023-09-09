import { either, function as func } from 'fp-ts';
import { runCommandSync } from '../utils/runCommand';
import { logger } from '../logger';
import { findCommand } from '../utils/command';
import { HUSKY } from '../commandPaths';

const PRE_COMMIT = `
#!/bin/sh

lint-staged --config ./node_modules/@craigmiller160/js-config/configs/eslint/.lintstagedrc
`;

const installHusky = (cwd: string, process: NodeJS.Process) =>
	func.pipe(
		findCommand(process, HUSKY),
		either.chain((command) =>
			runCommandSync(`${command} install`, {
				cwd
			})
		)
	);

const writePreCommitScript = (cwd: string) => {

};

export const setupGitHooks = (
	cwd: string,
	process: NodeJS.Process
): either.Either<Error, unknown> => {
	logger.info('Setting up git hooks');
	return func.pipe(
		installHusky(cwd, process),
		either.map(() => writePreCommitScript(cwd))
	);
};
