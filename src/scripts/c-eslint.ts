import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { getRealArgs } from './utils/process';
import { findCommand } from './utils/command';
import { ESLINT } from './commandPaths';
import { logger } from './logger';
import { ControlFile, parseControlFile } from './files/ControlFile';
import { match } from 'ts-pattern';
import path from 'path';

const getConfigFilePath =
	(process: NodeJS.Process) =>
	(controlFile: ControlFile): string => {
		const configFileName = match(controlFile.projectType)
			.with('module', () => 'eslint.config.js')
			.otherwise(() => 'eslint.config.mjs');
		return path.join(process.cwd(), configFileName);
	};

const getTargetPaths =
	(args: ReadonlyArray<string>) =>
	(controlFile: ControlFile): string => {
		if (args.length > 0) {
			return args[0];
		}

		const rootDirs = [
			'src',
			controlFile.directories.test ? 'test' : undefined,
			controlFile.directories.cypress ? 'cypress' : undefined
		]
			.filter((dir): dir is string => !!dir)
			.join(',');
		return `{${rootDirs}}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`;
	};

export const execute = (process: NodeJS.Process) => {
	logger.info('Running eslint');
	const args = getRealArgs(process);
	const getConfigFileWithProcess = getConfigFilePath(process);
	const getTargetPathsWithArgs = getTargetPaths(args);

	func.pipe(
		parseControlFile(process),
		either.bindTo('controlFile'),
		either.bind('configFile', ({ controlFile }) =>
			either.right(getConfigFileWithProcess(controlFile))
		),
		either.bind('targetPaths', ({ controlFile }) =>
			either.right(getTargetPathsWithArgs(controlFile))
		),
		either.bind('command', () => findCommand(process, ESLINT)),
		either.chain(({ configFile, targetPaths, command }) =>
			runCommandSync(
				`${command} --config ${configFile} --fix --max-warnings=0 ${targetPaths}`,
				{
					env: {
						...process.env,
						ESLINT_USE_FLAT_CONFIG: 'true'
					}
				}
			)
		),
		either.fold(terminate, terminate)
	);
};
