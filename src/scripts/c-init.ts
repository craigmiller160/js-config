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
import { getRealArgs } from './utils/process';

export type NodeOrBrowser = 'node' | 'browser';

type PerformInitializationArgs = Readonly<{
	cwd: string;
	nodeOrBrowser: NodeOrBrowser;
}>;

const performInitialization =
	(process: NodeJS.Process) =>
	({
		cwd,
		nodeOrBrowser
	}: PerformInitializationArgs): taskEither.TaskEither<Error, unknown> => {
		if (cwd === '') {
			logger.debug('Blank CWD found. Aborting initialization');
			return taskEither.right(func.constVoid());
		}

		logger.debug(`INIT_CWD: ${process.env.INIT_CWD}`);
		if (!!process.env.INIT_CWD && process.env.INIT_CWD !== cwd) {
			logger.debug(
				'INIT_CWD exists and does not match process cwd. Aborting initialization because this script has been called from a dependency'
			);
			return taskEither.right(func.constVoid());
		}

		const hasTestDirectory = fs.existsSync(path.join(cwd, 'test'));
		const hasCypressDirectory = fs.existsSync(path.join(cwd, 'cypress'));

		return func.pipe(
			parsePackageJson(path.join(cwd, 'package.json')),
			either.bindTo('packageJson'),
			either.chainFirst(({ packageJson }) => setupVite(cwd, packageJson)),
			either.chainFirst(({ packageJson }) =>
				setupTypescript(cwd, packageJson.type, nodeOrBrowser, {
					test: hasTestDirectory,
					cypress: hasCypressDirectory
				})
			),
			either.bind('eslintPlugins', () =>
				either.right(setupEslintPlugins())
			),
			either.chainFirst(() => setupStylelint(cwd)),
			either.chainFirst(() => setupGitHooks(cwd, process)),
			taskEither.fromEither,
			taskEither.chainFirst(({ packageJson }) =>
				setupEslintFiles(cwd, packageJson)
			),
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

export const getNodeOrBrowser = (
	process: NodeJS.Process
): either.Either<Error, NodeOrBrowser> => {
	const args = getRealArgs(process);
	if (args.length > 1) {
		return either.left(new Error('Too many arguments'));
	}

	if (args.length === 0) {
		return either.left(new Error('Missing node or browser argument'));
	}

	if (args.includes('node')) {
		return either.right('node');
	}

	if (args.includes('browser')) {
		return either.right('browser');
	}

	return either.left(new Error('Invalid node or browser argument'));
};

export const execute = (process: NodeJS.Process): Promise<void> => {
	logger.info('Initializing project');

	return func.pipe(
		findCwd(process),
		either.bindTo('cwd'),
		either.bind('nodeOrBrowser', () => getNodeOrBrowser(process)),
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
