import {runCommandSync} from './utils/runCommand';
import path from 'path';
import fs from 'fs';

export const execute = (process: NodeJS.Process) => {
    const testTsconfigPath = path.join(process.cwd(), 'test', 'tsconfig.json');
    if (fs.existsSync(testTsconfigPath)) {
        runCommandSync('tsc --noEmit --project ./test/tsconfig.json');
    } else {
        runCommandSync('tsc --noEmit');
    }

    const cypressTsconfigPath = path.join(process.cwd(), 'cypress', 'tsconfig.json');
    if (fs.existsSync(cypressTsconfigPath)) {
        runCommandSync('tsc --noEmit --project ./cypress/tsconfig.json');
    }
};