import { logger } from './logger';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running cypress dev server');
	throw new Error();
};
