import {runCommandSync} from './utils/runCommand';
import path from 'path';
import fs from 'fs';
import {logger} from './logger';
import {terminate} from './utils/terminate';
import {either, function as func} from 'fp-ts';

const runRootTypeCheck = (): either.Either<Error, unknown> => {
    const testTsconfigPath = path.join(process.cwd(), 'test', 'tsconfig.json');
    if (fs.existsSync(testTsconfigPath)) {
        logger.debug('Using test tsconfig.json for type check');
        return runCommandSync('tsc --noEmit --project ./test/tsconfig.json');
    }

    logger.debug('Using base tsconfig.json for type check');
    return runCommandSync('tsc --noEmit');
};

const runCypressTypeCheck = (): either.Either<Error, unknown> => {
    const cypressTsconfigPath = path.join(process.cwd(), 'cypress', 'tsconfig.json');
    if (fs.existsSync(cypressTsconfigPath)) {
        logger.debug('Cypress detected, performing cypress type check');
        return runCommandSync('tsc --noEmit --project ./cypress/tsconfig.json');
    }

    logger.debug('Cypress not present, skipping cypress type check');
    return either.right(func.constVoid());
};

export const execute = (process: NodeJS.Process) => {
    logger.info('Performing typescript type check');
    func.pipe(
        runRootTypeCheck(),
        either.chain(() => runCypressTypeCheck()),
        either.fold(
            terminate,
            terminate
        )
    );
};