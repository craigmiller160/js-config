import * as t from 'io-ts';
import { either, json, function as func } from 'fp-ts';
import {unknownToError} from './unknownToError';
import { formatValidationErrors } from 'io-ts-reporters';
import fs from 'fs';
import {decode} from './decode';

export const packageJsonCodec = t.readonly(t.type({
    name: t.string,
    version: t.string
}));

export type PackageJson = t.TypeOf<typeof packageJsonCodec>;

export const parsePackageJson = (packageJsonPath: string): either.Either<Error, PackageJson> =>
    func.pipe(
        either.tryCatch(() => fs.readFileSync(packageJsonPath, 'utf8'), unknownToError),
        either.chain(json.parse),
        either.mapLeft(unknownToError),
        either.chain(decode(packageJsonCodec))
    );