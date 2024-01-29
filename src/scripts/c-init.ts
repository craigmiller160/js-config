import { findCwd } from './utils/cwd';
import {
	function as func,
	either,
	taskEither,
	readerTaskEither,
	reader,
	readerEither
} from 'fp-ts';
import { logger } from './logger';
import { terminate } from './utils/terminate';
import { setupTypescript } from './init/setupTypescript';
import { PackageJson, parsePackageJson } from './files/PackageJson';
import path from 'path';
import { generateControlFile } from './init/generateControlFile';
import { setupEslintFiles } from './init/setupEslintFiles';
import { setupEslintPlugins } from './init/setupEslintPlugins';
import { setupGitHooks } from './init/setupGitHooks';
import { setupVite } from './init/setupVite';
import { setupStylelint } from './init/setupStylelint';
import fs from 'fs';
import { getRealArgs } from './utils/process';
import { IsLibraryPresent, isLibraryPresent } from './utils/library';
import { RunCommandSync, runCommandSync } from './utils/runCommand';
import {
	getCypressDirectoryPath,
	getPackageJsonPath,
	getTestDirectoryPath
} from '../utils/paths';
import { readerTaskEitherUtils } from '../utils/fpTs';

export type LibOrApp = 'lib' | 'app';

type PerformInitializationArgs = Readonly<{
	cwd: string;
	libOrApp: LibOrApp;
}>;

type PerformInitializationDependencies = Readonly<{
	process: NodeJS.Process;
	runCommandSync: RunCommandSync;
	isLibraryPresent: IsLibraryPresent;
}>;

const performInitialization = (
	cwd: string,
	libOrApp: LibOrApp
): readerTaskEither.ReaderTaskEither<
	PerformInitializationDependencies,
	Error,
	unknown
> => {
	if (cwd === '') {
		logger.debug('Blank CWD found. Aborting initialization');
		return readerTaskEither.right(func.constVoid());
	}

	logger.debug(`INIT_CWD: ${process.env.INIT_CWD}`);
	if (!!process.env.INIT_CWD && process.env.INIT_CWD !== cwd) {
		logger.debug(
			'INIT_CWD exists and does not match process cwd. Aborting initialization because this script has been called from a dependency'
		);
		return readerTaskEither.right(func.constVoid());
	}

	const hasTestDirectory = fs.existsSync(getTestDirectoryPath(cwd));
	const hasCypressDirectory = fs.existsSync(getCypressDirectoryPath(cwd));

	func.pipe(
		parsePackageJson(getPackageJsonPath(cwd)),
		either.bindTo('packageJson'),
		either.chainFirst(({ packageJson }) => setupVite(cwd, packageJson)),
		either.chainFirst(() => setupStylelint(cwd)),
		taskEither.fromEither,
		taskEither.chainFirst(({ packageJson }) =>
			setupEslintFiles(cwd, packageJson)
		),
		(te) =>
			readerTaskEither.fromTaskEither<
				Error,
				{ packageJson: PackageJson },
				PerformInitializationDependencies
			>(te),
		readerTaskEitherUtils.narrowAndChainFirstReaderK(
			(d) => ({ isLibraryPresent: d.isLibraryPresent }),
			() => setupEslintPlugins
		),
		readerTaskEitherUtils.narrowAndChainFirstReaderEitherK(
			(d) => ({ isLibraryPresent: d.isLibraryPresent }),
			({ packageJson }) =>
				setupTypescript(cwd, packageJson.type, libOrApp, {
					test: hasTestDirectory,
					cypress: hasCypressDirectory
				})
		),
		readerTaskEither.chainFirstReaderEitherK(() =>
			readerEither.local<
				PerformInitializationDependencies,
				Pick<
					PerformInitializationDependencies,
					'runCommandSync' | 'process'
				>
			>((d) => ({
				runCommandSync: d.runCommandSync,
				process: d.process
			}))(setupGitHooks(cwd))
		)
	);

	throw new Error();
};

const performInitialization2 =
	(process: NodeJS.Process) =>
	({
		cwd,
		libOrApp
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
				setupTypescript(cwd, packageJson.type, libOrApp, {
					test: hasTestDirectory,
					cypress: hasCypressDirectory
				})({ isLibraryPresent })
			),
			either.bind('eslintPlugins', () =>
				either.right(setupEslintPlugins({ isLibraryPresent }))
			),
			either.chainFirst(() => setupStylelint(cwd)),
			either.chainFirst(() =>
				setupGitHooks(cwd)({ process, runCommandSync })
			),
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

export const getLibOrApp = (
	process: NodeJS.Process
): either.Either<Error, LibOrApp> => {
	const args = getRealArgs(process);
	if (args.length > 1) {
		return either.left(new Error('Too many arguments'));
	}

	if (args.length === 0) {
		return either.left(new Error('Missing lib or app argument'));
	}

	if (args.includes('lib')) {
		return either.right('lib');
	}

	if (args.includes('app')) {
		return either.right('app');
	}

	return either.left(new Error('Invalid lib or app argument'));
};

export const execute = (process: NodeJS.Process): Promise<void> => {
	logger.info('Initializing project');

	return func.pipe(
		findCwd(process),
		either.bindTo('cwd'),
		either.bind('libOrApp', () => getLibOrApp(process)),
		taskEither.fromEither,
		taskEither.chain(performInitialization2(process)),
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
