import { either, function as func } from 'fp-ts';
import { runCommandSync } from '../utils/runCommand';
import { logger } from '../logger';
import { findCommand } from '../utils/command';
import { HUSKY, LINT_STAGED } from '../commandPaths';
import path from 'path';
import fs from 'fs';
import { unknownToError } from '../utils/unknownToError';

const createPreCommit = (commandPath: string): string =>
	`
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

${commandPath} --config ./node_modules/@craigmiller160/js-config/configs/eslint/.lintstagedrc
`.trim();

const installHusky = (cwd: string, process: NodeJS.Process) =>
	func.pipe(
		findCommand(process, HUSKY),
		either.chain((command) =>
			runCommandSync(`${command} install`, {
				cwd
			})
		)
	);

const writePreCommitScript = (
	lintStagedCommand: string,
	cwd: string
): either.Either<Error, unknown> => {
	const huskyDir = path.join(cwd, '.husky');
	if (!fs.existsSync(huskyDir)) {
		return either.left(new Error('Husky failed to install correctly'));
	}
	const preCommitPath = path.join(huskyDir, 'pre-commit');

	return either.tryCatch(() => {
		fs.writeFileSync(preCommitPath, createPreCommit(lintStagedCommand));
		fs.chmodSync(preCommitPath, 0o755);
	}, unknownToError);
};

export const setupGitHooks = (
	cwd: string,
	process: NodeJS.Process
): either.Either<Error, unknown> => {
	logger.info('Setting up git hooks');
	const gitDir = path.join(cwd, '.git');
	if (!fs.existsSync(gitDir)) {
		logger.warn('Git is not setup in the project, skipping githook setup');
		return either.right(func.constVoid());
	}

	return func.pipe(
		installHusky(cwd, process),
		either.chain(() => findCommand(process, LINT_STAGED)),
		either.chain((command) => writePreCommitScript(command, cwd))
	);
};
