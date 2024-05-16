import { either, function as func } from 'fp-ts';
import { logger } from '../logger';
import { findCommand } from '../utils/command';
import { TSC } from '../commandPaths';
import { runCommandSync } from '../utils/runCommand';

export const generateTypes = (
    process: NodeJS.Process,
    destDir: string,
    cwd?: string
): either.Either<Error, unknown> => {
    logger.debug('Generating type declarations');
    return func.pipe(
        findCommand(process, TSC),
        either.chain((command) =>
            runCommandSync(
                `${command} --declaration --emitDeclarationOnly --outDir ${destDir}`,
                {
                    cwd: cwd ?? process.cwd()
                }
            )
        )
    );
};
