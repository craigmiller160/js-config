import path from 'path';
import compileFunctions from '../src/scripts/compile/index.js';
import typesFunctions from '../src/scripts/compile/generateTypes.js';
import fs from 'fs/promises';
const { createCompile } = compileFunctions;
const { generateTypes } = typesFunctions;
import { function as func, taskEither, readonlyArray, either } from 'fp-ts';

const SRC_DIR = path.join(process.cwd(), 'viteSrc');
const DEST_DIR = path.join(process.cwd(), 'lib', 'cjs');
const DEST_TYPES_DIR = path.join(process.cwd(), 'lib', 'types', 'vite');

const compile = createCompile(SRC_DIR, DEST_DIR, 'es6');
const CODE_FILE_EXT_REGEX = /\.[mc][jt]s$/;

const fixExtension = (file: string): taskEither.TaskEither<Error, string> => {
    const newFile = file.replace(/.js$/, '.mjs');
    return func.pipe(
        taskEither.tryCatch(() => fs.rename(file, newFile), either.toError),
        taskEither.map(() => newFile)
    );
};

const compileCodeFiles = (
    files: ReadonlyArray<string>
): taskEither.TaskEither<Error, ReadonlyArray<string>> =>
    func.pipe(
        files,
        readonlyArray.filter((file) => CODE_FILE_EXT_REGEX.test(file)),
        readonlyArray.map((file) => path.join(SRC_DIR, file)),
        readonlyArray.map((file) => compile(file)),
        taskEither.sequenceArray,
        taskEither.chain(
            func.flow(readonlyArray.map(fixExtension), taskEither.sequenceArray)
        )
    );

const copyFile = ([srcFile, destFile]: [string, string]): taskEither.TaskEither<
    Error,
    void
> => {
    const directory = path.dirname(destFile);
    return func.pipe(
        taskEither.tryCatch(
            () =>
                fs.mkdir(directory, {
                    recursive: true
                }),
            either.toError
        ),
        taskEither.chain(() =>
            taskEither.tryCatch(
                () => fs.copyFile(srcFile, destFile),
                either.toError
            )
        )
    );
};

const prepareFilePaths = (file: string): [string, string] => [
    path.join(SRC_DIR, file),
    path.join(DEST_DIR, file)
];

const copyNonCodeFiles = (
    files: ReadonlyArray<string>
): taskEither.TaskEither<Error, ReadonlyArray<string>> =>
    func.pipe(
        files,
        readonlyArray.filter((file) => !CODE_FILE_EXT_REGEX.test(file)),
        readonlyArray.map(prepareFilePaths),
        readonlyArray.map(copyFile),
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
    taskEither.bindTo('files'),
    taskEither.chainFirst(({ files }) => compileCodeFiles(files)),
    taskEither.chainFirst(({ files }) => copyNonCodeFiles(files)),
    taskEither.chainFirstEitherK(() =>
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
