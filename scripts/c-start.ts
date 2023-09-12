import { runCommandSync } from './utils/runCommand';
import { either, function as func } from 'fp-ts';
import { terminate } from './utils/terminate';
import { logger } from './logger';

export const execute = () => {
	logger.info('Starting dev server');
	func.pipe(runCommandSync('vite start'), either.fold(terminate, terminate));
};
