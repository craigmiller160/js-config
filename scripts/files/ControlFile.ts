import * as t from 'io-ts';
import {either, function as func, json} from 'fp-ts';
import fs from 'fs';
import {unknownToError} from '../utils/unknownToError';
import {decode} from '../utils/decode';
import path from 'path';

export const controlFileCodec = t.readonly(t.type({
    workingDirectoryPath: t.string
}));

export type ControlFile = t.TypeOf<typeof controlFileCodec>;

export const getControlFilePath = (cwd: string) => path.join(cwd, 'control-file.json');

export const parseControlFile = (process: NodeJS.Process): either.Either<Error, ControlFile> =>
    func.pipe(
        either.tryCatch(() => fs.readFileSync(getControlFilePath(process.cwd()), 'utf8'), unknownToError),
        either.chain(json.parse),
        either.mapLeft(unknownToError),
        either.chain(decode(controlFileCodec))
    );