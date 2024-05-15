import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { getRealArgs } from './utils/process';
import { findCommand } from './utils/command';
import { ESLINT } from './commandPaths';
import { logger } from './logger';
import { ControlFile, parseControlFile } from './files/ControlFile';
import path from 'path';
import { match, P } from 'ts-pattern';

const getTargetPaths =
    (args: ReadonlyArray<string>) =>
    (controlFile: ControlFile): string => {
        if (args.length > 0) {
            return args[0];
        }

        const rootDirs = [
            'src',
            controlFile.directories.test ? 'test' : undefined,
            controlFile.directories.cypress ? 'cypress' : undefined
        ].filter((dir): dir is string => !!dir);

        const rootDirString = match(rootDirs)
            .with([P.string], (_) => _[0])
            .otherwise((_) => `{${_.join(',')}}`);

        return `${rootDirString}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`;
    };

export const execute = (process: NodeJS.Process) => {
    logger.info('Running eslint');
    const args = getRealArgs(process);
    const getTargetPathsWithArgs = getTargetPaths(args);
    const configFile = path.join(process.cwd(), 'eslint.config.js');

    func.pipe(
        parseControlFile(process),
        either.bindTo('controlFile'),
        either.bind('targetPaths', ({ controlFile }) =>
            either.right(getTargetPathsWithArgs(controlFile))
        ),
        either.bind('command', () => findCommand(process, ESLINT)),
        either.chain(({ targetPaths, command }) =>
            runCommandSync(
                `${command} --config ${configFile} --fix --max-warnings=0 ${targetPaths}`,
                {
                    env: {
                        ...process.env,
                        ESLINT_USE_FLAT_CONFIG: 'true'
                    }
                }
            )
        ),
        either.fold(terminate, terminate)
    );
};
