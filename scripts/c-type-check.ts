import {runCommandSync} from './utils/runCommand';
import path from 'path';
import fs from 'fs';
import {logger} from './logger';

export const execute = (process: NodeJS.Process) => {
    logger.info('Performing typescript type check');
    const testTsconfigPath = path.join(process.cwd(), 'test', 'tsconfig.json');
    if (fs.existsSync(testTsconfigPath)) {
        logger.debug('Using test tsconfig.json for type check');
        runCommandSync('tsc --noEmit --project ./test/tsconfig.json');
    } else {
        logger.debug('Using base tsconfig.json for type check');
        runCommandSync('tsc --noEmit');
    }

    const cypressTsconfigPath = path.join(process.cwd(), 'cypress', 'tsconfig.json');
    if (fs.existsSync(cypressTsconfigPath)) {
        logger.debug('Cypress detected, performing cypress type check');
        runCommandSync('tsc --noEmit --project ./cypress/tsconfig.json');
    } else {
        logger.debug('Cypress not present, skipping cypress type check');
    }
};