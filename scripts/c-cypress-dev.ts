import { logger } from './logger';
import { either, function as func } from 'fp-ts';
import { findCommand } from './utils/command';
import { CYPRESS } from './commandPaths';
import { runCommandSync } from './utils/runCommand';
import { terminate } from './utils/terminate';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running cypress dev server');
	func.pipe(
		findCommand(process, CYPRESS),
		either.chain((command) => runCommandSync(`${command} open`)),
		either.fold(terminate, terminate)
	);
};
