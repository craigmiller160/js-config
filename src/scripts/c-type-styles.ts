import {
    RunCommandSync,
    runCommandSync as defaultRunCommandSync
} from './utils/runCommand';
import { logger } from './logger';
import { function as func, either } from 'fp-ts';
import { findCommand } from './utils/command';
import { TYPED_CSS_MODULES, TYPED_SCSS_MODULES } from './commandPaths';
import { terminate } from './utils/terminate';
import path from 'path';

export type Dependencies = Readonly<{
    process: NodeJS.Process;
    runCommandSync: RunCommandSync;
}>;

const createPathPattern = (ext: string): string =>
    path.join('src', '**', `*.module.${ext}`);

export const execute = (
    dependencies: Dependencies = {
        process,
        runCommandSync: defaultRunCommandSync
    }
) => {
    const { process, runCommandSync } = dependencies;
    logger.info('Generating types for CSS/SCSS modules');

    const runTypeCssModules = () =>
        func.pipe(
            findCommand(process, TYPED_CSS_MODULES),
            either.bindTo('cmd'),
            either.bind('pathPattern', () =>
                either.right(createPathPattern('css'))
            ),
            either.chain(({ cmd, pathPattern }) =>
                runCommandSync(`${cmd} -p ${pathPattern}`)
            )
        );
    const runTypeScssModules = () =>
        func.pipe(
            findCommand(process, TYPED_SCSS_MODULES),
            either.bindTo('cmd'),
            either.bind('pathPattern', () =>
                either.right(createPathPattern('scss'))
            ),
            either.chain(({ cmd, pathPattern }) =>
                runCommandSync(`${cmd} ${pathPattern}`)
            )
        );

    func.pipe(
        runTypeCssModules(),
        either.chain(() => runTypeScssModules()),
        either.fold(terminate, terminate)
    );
};
