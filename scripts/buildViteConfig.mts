import path from 'path';
import { createCompile } from '../src/scripts/compile/index.js';
import fs from 'fs/promises';

const SRC_DIR = path.join(process.cwd(), 'viteSrc');
const DEST_DIR = path.join(process.cwd(), 'lib', 'esm');

const compile = createCompile(SRC_DIR, DEST_DIR, 'es6');

fs.readdir(SRC_DIR, {
    recursive: true
})
    .then((files) => files.forEach((file) => console.log(file)))
    .catch((ex) => {
        console.error(ex);
        process.exit(1);
    });
