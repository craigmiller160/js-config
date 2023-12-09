import { findCwd } from './utils/cwd';
import { function as func, either } from 'fp-ts';
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
	(cwd: string): either.Either<Error, unknown> => {
		if (cwd === '') {
			logger.debug('Blank CWD found, aborting initialization');
			return either.right(func.constVoid());
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
			either.chainFirst(({ packageJson }) =>
				setupEslintFiles(cwd, packageJson)
			),
			either.bind('eslintPlugins', () =>
				either.right(setupEslintPlugins())
			),
			either.chainFirst(() => setupStylelint(cwd)),
			either.chainFirst(() => setupGitHooks(cwd, process)),
			either.chainFirst(({ packageJson, eslintPlugins }) =>
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

export const execute = (process: NodeJS.Process) => {
	logger.info('Initializing project');
	func.pipe(
		findCwd(process),
		either.chain(performInitialization(process)),
		either.fold(terminate, terminate)
	);
};
