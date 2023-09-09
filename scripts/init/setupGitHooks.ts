import { either } from 'fp-ts';
import { runCommandSync } from '../utils/runCommand';

export const setupGitHooks = (): either.Either<Error, unknown> => {
	return runCommandSync('husky install');
};
