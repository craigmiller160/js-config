import path from 'path';
import fs from 'fs';
import {logger} from './logger';
import {runCommandSync} from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import {terminate} from './utils/terminate';


export const execute = (process: NodeJS.Process) => {
    logger.info('Performing library build');
    const srcDir = path.join(process.cwd(), 'src');
    const libDir = path.join(process.cwd(), 'lib');
    if (fs.existsSync(libDir)) {
        fs.rmSync(libDir, {
            recursive: true,
            force: true
        });
    }

    const esModuleDir = path.join(libDir, 'es');
    const configPath = path.join(__dirname, '..', 'configs', 'swc', '.swcrc');

    func.pipe(
        runCommandSync(`swc ${srcDir} -d ${esModuleDir} --config-file ${configPath} -C module.type=es6`),
        either.fold(
            terminate,
            terminate
        )
    );
};