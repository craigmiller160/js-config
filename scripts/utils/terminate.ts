import {logger} from '../logger';

export const terminate = (error: Error): void => {
    logger.error(error);
    logger.on('finish', () => {
        process.exit(1);
    });
}