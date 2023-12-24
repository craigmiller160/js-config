import { findCwd } from './utils/cwd';
import { function as func, either, taskEither } from 'fp-ts';
import { logger } from './logger';
import { terminate } from './utils/terminate';
import { setupTypescript } from './init/setupTypescript';
import { parsePackageJson } from './files/PackageJson';
import path from 'path';
import { generateControlFile } from './init/generateControlFile';
import { setupEslintFiles } from './init/setupEslintFiles';
import { setupEslintPlugins } from './init/setupEslintPlugins';
import { setupGitHooks } from './init/setupGitHooks';
import { setupVite } from './init/setupVite';
import { setupStylelint } from './init/setupStylelint';
import fs from 'fs';

const performInitialization =
	(process: NodeJS.Process) =>
	(cwd: string): taskEither.TaskEither<Error, unknown> => {
		if (cwd === '') {
			logger.debug('Blank CWD found, aborting initialization');
			return taskEither.right(func.constVoid());
		}

		const hasTestDirectory = fs.existsSync(path.join(cwd, 'test'));
		const hasCypressDirectory = fs.existsSync(path.join(cwd, 'cypress'));

		return func.pipe(
			parsePackageJson(path.join(cwd, 'package.json')),
			either.bindTo('packageJson'),
			either.chainFirst(({ packageJson }) => setupVite(cwd, packageJson)),
			either.chainFirst(({ packageJson }) =>
				setupTypescript(cwd, packageJson.type)
			),
			either.bind('eslintPlugins', () =>
				either.right(setupEslintPlugins())
			),
			either.chainFirst(() => setupStylelint(cwd)),
			either.chainFirst(() => setupGitHooks(cwd, process)),
			taskEither.fromEither,
			taskEither.chainFirst(({ packageJson }) => setupEslintFiles(cwd, packageJson)),
			taskEither.chainEitherK(({ packageJson, eslintPlugins }) =>
				generateControlFile(
					cwd,
					packageJson,
					eslintPlugins,
					hasTestDirectory,
					hasCypressDirectory,
					process
				)
			)
		);
	};

export const execute = (process: NodeJS.Process): Promise<void> => {
	logger.info('Initializing project');
	return func.pipe(
		findCwd(process),
		taskEither.fromEither,
		taskEither.chain(performInitialization(process)),
		taskEither.fold(
			(ex) => () => {
				terminate(ex);
				return Promise.resolve();
			},
			() => () => {
				terminate('');
				return Promise.resolve();
			}
		)
	)();
};
