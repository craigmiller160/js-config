import { logger } from './logger';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running all cypress tests');
	throw new Error();
};
