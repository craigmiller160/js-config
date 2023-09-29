import { runCommandAsync } from './utils/runCommand';
import { logger } from './logger';
import { findCommand } from './utils/command';
import { TSC, VITE } from './commandPaths';
import { either, function as func } from 'fp-ts';
import { terminate } from './utils/terminate';
import { getRealArgs } from './utils/process';
import path from 'path';

export const execute = (process: NodeJS.Process) => {
	logger.info('Starting dev server');

	const args = getRealArgs(process).join(' ');
	const config = path.join(process.cwd(), 'vite.config.mts');

	func.pipe(
		findCommand(process, VITE),
		either.bindTo('viteCommand'),
		either.bind('tscCommand', () => findCommand(process, TSC)),
		either.fold(terminate, ({ viteCommand, tscCommand }) => {
			runCommandAsync(`${viteCommand} start ${args} -c ${config}`)();
			runCommandAsync(`${tscCommand} --noEmit --watch`)();
		})
	);
};
