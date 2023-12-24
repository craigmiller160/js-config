import { taskEither } from 'fp-ts';
import { logger } from '../logger';
import { PackageJson } from '../files/PackageJson';

export const setupEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): taskEither.TaskEither<Error, void> => {
	logger.info('Setting up eslint files');
	throw new Error();
};
