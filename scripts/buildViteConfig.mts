import path from 'path';
import compileFunctions from '../src/scripts/compile/index.js';
import typesFunctions from '../src/scripts/compile/generateTypes.js';
import fs from 'fs/promises';
const { createCompile } = compileFunctions;
const { generateTypes } = typesFunctions;
import { function as func, taskEither, readonlyArray, either } from 'fp-ts';

const SRC_DIR = path.join(process.cwd(), 'viteSrc');
const DEST_DIR = path.join(process.cwd(), 'lib', 'esm');
const DEST_TYPES_DIR = path.join(process.cwd(), 'lib', 'types');

const compile = createCompile(SRC_DIR, DEST_DIR, 'es6');

const handleFiles = (
    files: ReadonlyArray<string>
): taskEither.TaskEither<Error, ReadonlyArray<string>> =>
    func.pipe(
        files,
        readonlyArray.filter(
            (file) => file.endsWith('js') || file.endsWith('ts')
        ),
        readonlyArray.map((file) => path.join(SRC_DIR, file)),
        readonlyArray.map((file) => compile(file)),
        taskEither.sequenceArray,
        taskEither.map(() => files)
    );

void func.pipe(
    taskEither.tryCatch(
        () =>
            fs.readdir(SRC_DIR, {
                recursive: true
            }),
        either.toError
    ),
    taskEither.chain((files) => handleFiles(files)),
    taskEither.chainEitherK(() =>
        generateTypes(process, DEST_TYPES_DIR, SRC_DIR)
    ),
    taskEither.fold(
        (ex) => () => {
            console.error(ex);
            process.exit(1);
        },
        () => () => Promise.resolve()
    )
)();
