import { logger } from '../logger';

export const terminate = (result: unknown): void => {
    if (result instanceof Error) {
        logger.error(result);
        if (process.env.NODE_ENV !== 'test') {
            process.exitCode = 1;
        }
    }
};
