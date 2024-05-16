import path from 'path';
import compileFunctions from '../src/scripts/compile/index.js';
import typesFunctions from '../src/scripts/compile/generateTypes.js';
import fs from 'fs/promises';
const { createCompile } = compileFunctions;
const { generateTypes } = typesFunctions;
import { function as func, taskEither, readonlyArray } from 'fp-ts';

const SRC_DIR = path.join(process.cwd(), 'viteSrc');
const DEST_DIR = path.join(process.cwd(), 'lib', 'esm');
const DEST_TYPES_DIR = path.join(process.cwd(), 'lib', 'types');

const compile = createCompile(SRC_DIR, DEST_DIR, 'es6');

const handleFiles = (files: ReadonlyArray<string>): Promise<unknown> =>
    func.pipe(
        files,
        readonlyArray.filter(
            (file) => file.endsWith('js') || file.endsWith('ts')
        ),
        readonlyArray.map((file) => compile(file)),
        taskEither.sequenceArray
    )();

fs.readdir(SRC_DIR, {
    recursive: true
})
    .then((files) => handleFiles(files))
    .then(() => generateTypes(process, DEST_TYPES_DIR, SRC_DIR))
    .catch((ex) => {
        console.error(ex);
        process.exit(1);
    });
