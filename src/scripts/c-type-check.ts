import {
    RunCommandSync,
    runCommandSync as defaultRunCommandSync
} from './utils/runCommand';
import path from 'path';
import { logger } from './logger';
import { terminate } from './utils/terminate';
import { either, function as func } from 'fp-ts';
import { findCommand } from './utils/command';
import { TSC } from './commandPaths';
import { parseControlFile } from './files/ControlFile';

export type Dependencies = Readonly<{
    process: NodeJS.Process;
    runCommandSync: RunCommandSync;
}>;

const createRunTypeCheck =
    (runCommandSync: RunCommandSync) =>
    (command: string, project: string): either.Either<Error, string> =>
        runCommandSync(`${command} --noEmit --project ${project}`);

export const execute = (
    dependencies: Dependencies = {
        process,
        runCommandSync: defaultRunCommandSync
    }
) => {
    const { process, runCommandSync } = dependencies;
    logger.info('Performing typescript type check');

    const runTypeCheck = createRunTypeCheck(runCommandSync);

    func.pipe(
        findCommand(process, TSC),
        either.bindTo('command'),
        either.bind('controlFile', () => parseControlFile(process)),
        either.chainFirst(({ command, controlFile }) => {
            const project = controlFile.directories.test
                ? path.join(process.cwd(), 'test', 'tsconfig.json')
                : path.join(process.cwd(), 'tsconfig.json');
            return runTypeCheck(command, project);
        }),
        either.chainFirst(({ command, controlFile }) => {
            if (controlFile.directories.cypress) {
                const project = path.join(
                    process.cwd(),
                    'cypress',
                    'tsconfig.json'
                );
                return runTypeCheck(command, project);
            }
            return either.right('');
        }),
        either.fold(terminate, terminate)
    );
};
