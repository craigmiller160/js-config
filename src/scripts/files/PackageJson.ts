import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import { decode } from '../utils/decode';

const dependenciesCodec = t.union([
	t.readonly(t.record(t.string, t.string)),
	t.undefined
]);

export const packageJsonTypeCodec = t.union([
	t.literal('module'),
	t.literal('commonjs')
]);
export type PackageJsonType = t.TypeOf<typeof packageJsonTypeCodec>;

export type PackageJsonDependencies = t.TypeOf<typeof dependenciesCodec>;

export const packageJsonCodec = t.readonly(
	t.type({
		name: t.string,
		version: t.string,
		type: t.union([packageJsonTypeCodec, t.undefined]),
		dependencies: dependenciesCodec,
		devDependencies: dependenciesCodec
	})
);

export type PackageJson = t.TypeOf<typeof packageJsonCodec> & {
	type: PackageJsonType;
};

export const parsePackageJson = (
	packageJsonPath: string
): either.Either<Error, PackageJson> =>
	func.pipe(
		either.tryCatch(
			() => fs.readFileSync(packageJsonPath, 'utf8'),
			either.toError
		),
		either.chain(json.parse),
		either.mapLeft(either.toError),
		either.chain(decode(packageJsonCodec)),
		either.map(
			(packageJson): PackageJson => ({
				...packageJson,
				type: packageJson.type ?? 'commonjs'
			})
		)
	);
