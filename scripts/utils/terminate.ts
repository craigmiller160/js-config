import { logger } from '../logger';

export const terminate = (result: Error | unknown): void => {
	if (result instanceof Error) {
		logger.error(result);
		process.exitCode = 1;
	}
};
