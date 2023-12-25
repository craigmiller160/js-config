import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import { decode } from '../utils/decode';

const stylelintrcCodec = t.readonly(
	t.type({
		extends: t.string,
		rules: t.union([
			t.record(t.string, t.union([t.boolean, t.array(t.unknown)])),
			t.undefined
		])
	})
);

export type Stylelintrc = t.TypeOf<typeof stylelintrcCodec>;

export const parseStylelintrc = (
	stylelintrcPath: string
): either.Either<Error, Stylelintrc> =>
	func.pipe(
		either.tryCatch(
			() => fs.readFileSync(stylelintrcPath, 'utf8'),
			either.toError
		),
		either.chain(json.parse),
		either.mapLeft(either.toError),
		either.chain(decode(stylelintrcCodec))
	);
