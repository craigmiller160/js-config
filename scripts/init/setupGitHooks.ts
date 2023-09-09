import { either, function as func } from 'fp-ts';
import { runCommandSync } from '../utils/runCommand';
import { logger } from '../logger';
import { findCommand } from '../utils/command';
import { HUSKY } from '../commandPaths';

export const setupGitHooks = (
	cwd: string,
	process: NodeJS.Process
): either.Either<Error, unknown> => {
	logger.info('Setting up git hooks');
	return func.pipe(
		findCommand(process, HUSKY),
		either.chain((command) =>
			runCommandSync(`${command} install`, {
				cwd
			})
		)
	);
};
