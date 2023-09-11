import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { logger } from './logger';
import { findCommand } from './utils/command';
import { STYLELINT } from './commandPaths';

// TODO integrate with lint staged
export const execute = (process: NodeJS.Process) => {
	logger.info('Running stylelint');
	func.pipe(
		findCommand(process, STYLELINT),
		either.chain((command) =>
			runCommandSync(`${command} src/**/*.{css,scss}`)
		),
		either.fold(terminate, terminate)
	);
};
