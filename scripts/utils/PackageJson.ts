import * as t from 'io-ts';
import { either, json, function as func } from 'fp-ts';
import {unknownToError} from './unknownToError';
import { formatValidationErrors } from 'io-ts-reporters';
import fs from 'fs';

export const packageJsonCodec = t.readonly(t.type({
    name: t.string,
    version: t.string
}));

export type PackageJson = t.TypeOf<typeof packageJsonCodec>;

const combineErrors = (errors: t.Errors): Error => {
    const allMessages = errors.map((error) => {

    })
        .join('; ');
    return new Error(`Type validation errors: ${allMessages}`);
};

export const parsePackageJson = (packageJsonPath: string): either.Either<Error, PackageJson> =>
    func.pipe(
        either.tryCatch(() => fs.readFileSync(packageJsonPath, 'utf8'), unknownToError),
        either.chain(json.parse),
        either.mapLeft(unknownToError),
        either.chain(func.flow(
            packageJsonCodec.decode,
            either.mapLeft(formatValidationErrors),
            either.mapLeft((errors) => new Error(errors.join('; ')))
        ))
    );