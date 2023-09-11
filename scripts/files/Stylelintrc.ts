import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import { unknownToError } from '../utils/unknownToError';
import { decode } from '../utils/decode';

const stylelintrcCodec = t.readonly(
	t.type({
		extends: t.string
	})
);

export type Stylelintrc = t.TypeOf<typeof stylelintrcCodec>;

export const parseStylelintrc = (
	stylelintrcPath: string
): either.Either<Error, Stylelintrc> =>
	func.pipe(
		either.tryCatch(
			() => fs.readFileSync(stylelintrcPath, 'utf8'),
			unknownToError
		),
		either.chain(json.parse),
		either.mapLeft(unknownToError),
		either.chain(decode(stylelintrcCodec))
	);
