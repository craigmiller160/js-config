import fs from 'fs';
import path from 'path';

export const execute = (process: NodeJS.Process) => {
    const theFilePath = path.join(process.cwd(), '..', 'foo.txt');
    fs.writeFileSync(theFilePath, 'Hello World 3');
};