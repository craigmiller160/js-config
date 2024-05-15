import { either, function as func } from 'fp-ts';
import { runCommandSync } from './utils/runCommand';
import { terminate } from './utils/terminate';
import { findCommand } from './utils/command';
import { VITE } from './commandPaths';
import { logger } from './logger';

export const execute = (process: NodeJS.Process) => {
    logger.info('Running application build');
    func.pipe(
        findCommand(process, VITE),
        either.chain((command) => runCommandSync(`${command} build`)),
        either.fold(terminate, terminate)
    );
};
