import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { getRealArgs } from './utils/process';
import { findCommand } from './utils/command';
import { ESLINT } from './commandPaths';
import { logger } from './logger';
import { parseControlFile } from './files/ControlFile';
import { match } from 'ts-pattern';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running eslint');
	const args = getRealArgs(process);

	func.pipe(
		parseControlFile(process),
		either.map((controlFile) => controlFile.projectType),
		either.map((type) =>
			match(type)
				.with('module', () => 'eslint.config.js')
				.otherwise(() => 'eslint.config.mjs')
		),
		either.bindTo('configFile'),
		either.bind('targetFile', () =>
			either.right(args[0] ? args[0] : undefined)
		),
		either.bind('command', () => findCommand(process, ESLINT)),
		either.chain(({ configFile, targetFile, command }) =>
			runCommandSync(
				`${command} --config ${configFile} --fix --max-warnings=0 ${targetFile}`
			)
		),
		either.fold(terminate, terminate)
	);
};
