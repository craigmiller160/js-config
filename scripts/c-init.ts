import {findCwd} from './utils/cwd';
import { function as func, either } from 'fp-ts';
import {logger} from './logger';
import {terminate} from './utils/terminate';
import {setupTypescript} from './init/setupTypescript';

const performInitialization = (process: NodeJS.Process) => (cwd: string): either.Either<Error, void> => {
    if (cwd === '') {
        logger.debug('Blank CWD found, aborting initialization');
        process.exit(0);
    }

    return setupTypescript(cwd);
};

export const execute = (process: NodeJS.Process) => {
    logger.info('Running command: c-init');
    func.pipe(
        findCwd(process),
        either.chain(performInitialization(process)),
        either.fold(
            terminate,
            terminate
        )
    );
};