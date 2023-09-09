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

const performInitialization =
	(process: NodeJS.Process) =>
	(cwd: string): either.Either<Error, unknown> => {
		if (cwd === '') {
			logger.debug('Blank CWD found, aborting initialization');
			return either.right(func.constVoid());
		}

		return func.pipe(
			parsePackageJson(path.join(cwd, 'package.json')),
			either.bindTo('packageJson'),
			either.chainFirst(() => setupTypescript(cwd)),
			either.chainFirst(() => setupEslintFiles(cwd)),
			either.bind('eslintPlugins', () =>
				either.right(setupEslintPlugins())
			),
			either.chainFirst(() => setupGitHooks(cwd, process)),
			either.chainFirst(({ packageJson, eslintPlugins }) =>
				generateControlFile(cwd, packageJson, eslintPlugins, process)
			)
		);
	};

export const execute = (process: NodeJS.Process) => {
	logger.info('Running command: c-init');
	func.pipe(
		findCwd(process),
		either.chain(performInitialization(process)),
		either.fold(terminate, terminate)
	);
};
