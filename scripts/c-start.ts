import { runCommandAsync } from './utils/runCommand';
import { logger } from './logger';
import { findCommand } from './utils/command';
import { TSC, VITE } from './commandPaths';
import { either, function as func } from 'fp-ts';
import { terminate } from './utils/terminate';

export const execute = (process: NodeJS.Process) => {
	logger.info('Starting dev server');

	func.pipe(
		findCommand(process, VITE),
		either.bindTo('viteCommand'),
		either.bind('tscCommand', () => findCommand(process, TSC)),
		either.fold(terminate, ({ viteCommand, tscCommand }) => {
			runCommandAsync(`${viteCommand} start`)();
			runCommandAsync(`${tscCommand} --noEmit --watch`)();
		})
	);
};
