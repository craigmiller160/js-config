import {findCwd} from './utils/cwd';
import { function as func, either } from 'fp-ts';
import path from 'path';
import fs from 'fs';
import {logger} from './logger';
import {terminate} from './utils/terminate';

const performInitialization = (process: NodeJS.Process) => (cwd: string) => {
    if (cwd === '') {
        logger.debug('Blank CWD found, aborting initialization');
        process.exit(0);
    }
};

export const execute = (process: NodeJS.Process) => {
    logger.info('Running command: c-init');
    func.pipe(
        findCwd(process),
        either.fold(
            terminate,
            performInitialization(process)
        )
    );
};