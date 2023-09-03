import {findCwd} from './utils/cwd';
import { function as func, either } from 'fp-ts';
import path from 'path';
import fs from 'fs';
import {logger} from './logger';

const performInitialization = (process: NodeJS.Process) => (cwd: string) => {
    const theFile = path.join(cwd, 'foo.txt');
    fs.writeFileSync(theFile, 'Hello World 123');
};

export const execute = (process: NodeJS.Process) => {
    logger.info('Running command: c-init');
    func.pipe(
        findCwd(process),
        either.fold(
            (error) => {
                logger.error(error);
                logger.on('finish', () => {
                    process.exit(1);
                });
            },
            performInitialization(process)
        )
    );
};