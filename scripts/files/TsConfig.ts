import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import { unknownToError } from '../utils/unknownToError';
import { decode } from '../utils/decode';

const compilerOptionsCodec = t.readonly(
	t.partial({
		types: t.readonlyArray(t.string),
		module: t.union([
			t.literal('AMD'),
			t.literal('CommonJS'),
			t.literal('ES2022'),
			t.literal('ESNext'),
			t.literal('Node16'),
			t.literal('NodeNext'),
			t.literal('System'),
			t.literal('UMD'),
			t.literal('None')
		]),
		moduleResolution: t.union([
			t.literal('node'),
			t.literal('node16'),
			t.literal('classic'),
			t.literal('nodenext'),
			t.literal('bundler')
		])
	})
);

export const tsConfigCodec = t.readonly(
	t.partial({
		extends: t.string,
		compilerOptions: compilerOptionsCodec,
		include: t.readonlyArray(t.string),
		exclude: t.readonlyArray(t.string),
		'ts-node': t.union([compilerOptionsCodec, t.undefined])
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
			unknownToError
		),
		either.chain(json.parse),
		either.mapLeft(unknownToError),
		either.chain(decode(tsConfigCodec))
	);
