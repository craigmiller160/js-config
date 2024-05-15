import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import { decode } from '../utils/decode';

const compilerOptionsCodec = t.readonly(
    t.partial({
        types: t.readonlyArray(t.string),
        module: t.union([
            t.literal('amd'),
            t.literal('commonjs'),
            t.literal('es2022'),
            t.literal('esnext'),
            t.literal('node16'),
            t.literal('nodenext'),
            t.literal('system'),
            t.literal('umd'),
            t.literal('none')
        ]),
        moduleResolution: t.union([
            t.literal('node'),
            t.literal('node16'),
            t.literal('classic'),
            t.literal('nodenext'),
            t.literal('bundler')
        ]),
        verbatimModuleSyntax: t.boolean
    })
);

export const tsConfigCodec = t.readonly(
    t.partial({
        extends: t.string,
        compilerOptions: compilerOptionsCodec,
        include: t.readonlyArray(t.string),
        exclude: t.readonlyArray(t.string),
        'ts-node': t.union([
            t.undefined,
            t.readonly(
                t.partial({
                    compilerOptions: t.union([
                        compilerOptionsCodec,
                        t.undefined
                    ])
                })
            )
        ])
    })
);

export type TsConfig = t.TypeOf<typeof tsConfigCodec>;
export type TsConfigCompilerOptions = t.TypeOf<typeof compilerOptionsCodec>;

export const parseTsConfig = (
    tsConfigPath: string
): either.Either<Error, TsConfig> =>
    func.pipe(
        either.tryCatch(
            () => fs.readFileSync(tsConfigPath, 'utf8'),
            either.toError
        ),
        either.chain(json.parse),
        either.mapLeft(either.toError),
        either.chain(decode(tsConfigCodec))
    );
