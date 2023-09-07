import * as t from 'io-ts';
import {either, function as func, json} from 'fp-ts';
import fs from 'fs';
import {unknownToError} from './unknownToError';
import {decode} from './decode';

export const controlFileCodec = t.readonly(t.type({
    workingDirectoryPath: t.string
}));

export type ControlFile = t.TypeOf<typeof controlFileCodec>;

export const parseControlFile = (controlFilePath: string): either.Either<Error, ControlFile> =>
    func.pipe(
        either.tryCatch(() => fs.readFileSync(controlFilePath, 'utf8'), unknownToError),
        either.chain(json.parse),
        either.mapLeft(unknownToError),
        either.chain(decode(controlFileCodec))
    );