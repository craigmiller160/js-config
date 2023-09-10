import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { logger } from './logger';

export const execute = () => {
	logger.info('Running stylelint');
	func.pipe(
		runCommandSync('stylelint -c XXX src/**/*.{css,scss}'),
		either.fold(terminate, terminate)
	);
};
