import { either, function as func } from 'fp-ts';
import { runCommandSync } from '../utils/runCommand';
import { logger } from '../logger';
import { findCommand } from '../utils/command';
import { HUSKY } from '../commandPaths';
import path from 'path';
import fs from 'fs';
import { unknownToError } from '../utils/unknownToError';

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

const writePreCommitScript = (cwd: string): either.Either<Error, unknown> => {
	const huskyDir = path.join(cwd, '.husky');
	if (!fs.existsSync(huskyDir)) {
		return either.left(new Error('Husky failed to install correctly'));
	}
	const preCommitPath = path.join(huskyDir, 'pre-commit');
	return either.tryCatch(() => {
		fs.writeFileSync(preCommitPath, PRE_COMMIT.trim());
		fs.chmodSync(preCommitPath, 0o755);
	}, unknownToError);
};

export const setupGitHooks = (
	cwd: string,
	process: NodeJS.Process
): either.Either<Error, unknown> => {
	logger.info('Setting up git hooks');
	return func.pipe(
		installHusky(cwd, process),
		either.chain(() => writePreCommitScript(cwd))
	);
};
