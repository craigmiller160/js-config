import { either } from 'fp-ts';

type StylelintConfig = Readonly<{
	extends: string;
}>;

export const setupStylelint = (
	cwd: string
): either.Either<Error, unknown> => {};
