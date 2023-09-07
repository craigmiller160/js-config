import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import {unknownToError} from '../utils/unknownToError';
import {decode} from '../utils/decode';

export const tsConfigCodec = t.readonly(t.partial({
    extends: t.string,
    compilerOptions: t.readonly(t.partial({
        types: t.readonlyArray(t.string)
    })),
    include: t.readonlyArray(t.string),
    exclude: t.readonlyArray(t.string)
}));

export type TsConfig = t.TypeOf<typeof tsConfigCodec>;

export const parseTsConfig = (tsConfigPath: string): either.Either<Error, TsConfig> =>
    func.pipe(
        either.tryCatch(() => fs.readFileSync(tsConfigPath, 'utf8'), unknownToError),
        either.chain(json.parse),
        either.mapLeft(unknownToError),
        either.chain(decode(tsConfigCodec))
    );