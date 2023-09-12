import { runCommandAsync } from './utils/runCommand';
import { logger } from './logger';

export const execute = () => {
	logger.info('Starting dev server');
	runCommandAsync('vite start')();
	runCommandAsync('tsc --noEmit --watch');
};
