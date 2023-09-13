import { logger } from './logger';

// cypress run --component -b electron
export const execute = (process: NodeJS.Process) => {
	logger.info('Running all cypress tests');
	throw new Error();
};
