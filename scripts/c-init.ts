import {findCwd} from './utils/cwd';
import { function as func, either } from 'fp-ts';
import path from 'path';
import fs from 'fs';

const performInitialization = (process: NodeJS.Process) => (cwd: string) => {
    const theFile = path.join(cwd, 'foo.txt');
    fs.writeFileSync(theFile, 'Hello World 123');
};

export const execute = (process: NodeJS.Process) => {
    func.pipe(
        findCwd(process),
        either.fold(
            (error) => {
                throw error
            },
            performInitialization(process)
        )
    );
};