import path from 'path';
import fs from 'fs';
import {logger} from './logger';
import {runCommandSync} from './utils/runCommand';


export const execute = (process: NodeJS.Process) => {
    logger.info('Performing library build');
    const libDir = path.join(process.cwd(), 'lib');
    if (fs.existsSync(libDir)) {
        fs.rmSync(libDir, {
            recursive: true,
            force: true
        });
    }

    runCommandSync('')
};