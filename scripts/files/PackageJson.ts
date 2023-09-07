import * as t from 'io-ts';
import { either, json, function as func } from 'fp-ts';
import {unknownToError} from '../utils/unknownToError';
import fs from 'fs';
import {decode} from '../utils/decode';

const dependenciesCodec = t.union([
    t.readonly(t.record(t.string, t.string)),
    t.undefined
]);

export type PackageJsonDependencies = t.TypeOf<typeof dependenciesCodec>;

export const packageJsonCodec = t.readonly(t.type({
    name: t.string,
    version: t.string,
    dependencies: dependenciesCodec,
    devDependencies: dependenciesCodec
}));

export type PackageJson = t.TypeOf<typeof packageJsonCodec>;

export const parsePackageJson = (packageJsonPath: string): either.Either<Error, PackageJson> =>
    func.pipe(
        either.tryCatch(() => fs.readFileSync(packageJsonPath, 'utf8'), unknownToError),
        either.chain(json.parse),
        either.mapLeft(unknownToError),
        either.chain(decode(packageJsonCodec))
    );