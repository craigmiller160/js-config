import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import { decode } from '../utils/decode';
import path from 'path';
import { packageJsonTypeCodec } from './PackageJson';

const directoryCodec = t.readonly(
    t.type({
        test: t.boolean,
        cypress: t.boolean
    })
);

const eslintPluginsCodec = t.readonly(
    t.type({
        react: t.boolean,
        jestDom: t.boolean,
        testingLibraryReact: t.boolean,
        vitest: t.boolean,
        cypress: t.boolean,
        tanstackQuery: t.boolean
    })
);

export const controlFileCodec = t.readonly(
    t.type({
        workingDirectoryPath: t.string,
        projectType: packageJsonTypeCodec,
        directories: directoryCodec,
        eslintPlugins: eslintPluginsCodec
    })
);

export type EslintPlugins = t.TypeOf<typeof eslintPluginsCodec>;
export type ControlFile = t.TypeOf<typeof controlFileCodec>;

export const getControlFilePath = (cwd: string): string =>
    path.join(cwd, '.js-config.json');

const findControlFile = (
    process: NodeJS.Process
): either.Either<Error, string> => {
    const controlFilePath = getControlFilePath(process.cwd());
    if (fs.existsSync(controlFilePath)) {
        return either.right(controlFilePath);
    }
    return either.left(new Error('Cannot find valid control file'));
};

export const parseControlFile = (
    process: NodeJS.Process
): either.Either<Error, ControlFile> =>
    func.pipe(
        findControlFile(process),
        either.chain((controlFile) =>
            either.tryCatch(
                () => fs.readFileSync(controlFile, 'utf8'),
                either.toError
            )
        ),
        either.chain(json.parse),
        either.mapLeft(either.toError),
        either.chain(decode(controlFileCodec))
    );
