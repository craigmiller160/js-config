import { runCommandAsync } from './utils/runCommand';
import { logger } from './logger';
import { findCommand } from './utils/command';
import { TSC, VITE } from './commandPaths';
import { either, function as func } from 'fp-ts';
import { terminate } from './utils/terminate';
import { getRealArgs } from './utils/process';
import { PackageJsonType } from './files/PackageJson';
import path from 'path';
import { match } from 'ts-pattern';
import { parseControlFile as parseControlFileDefault } from './files/ControlFile';

type ParseControlFile = typeof parseControlFileDefault;

const getExtension = (type: PackageJsonType): string =>
    match<PackageJsonType, string>(type)
        .with('module', () => 'ts')
        .with('commonjs', () => 'mts')
        .exhaustive();

const getConfigFile = (
    process: NodeJS.Process,
    parseControlFile: ParseControlFile
): either.Either<Error, string> =>
    func.pipe(
        parseControlFile(process),
        either.map((controlFile) => getExtension(controlFile.projectType)),
        either.map((ext) => path.join(process.cwd(), `vite.config.${ext}`))
    );

export const execute = (
    process: NodeJS.Process,
    parseControlFile: ParseControlFile = parseControlFileDefault
) => {
    logger.info('Starting dev server');

    const args = getRealArgs(process).join(' ');

    func.pipe(
        findCommand(process, VITE),
        either.bindTo('viteCommand'),
        either.bind('tscCommand', () => findCommand(process, TSC)),
        either.bind('config', () => getConfigFile(process, parseControlFile)),
        either.fold(terminate, ({ viteCommand, tscCommand, config }) => {
            void runCommandAsync(`${viteCommand} ${args} -c ${config}`)();
            void runCommandAsync(`${tscCommand} --noEmit --watch`)();
        })
    );
};
