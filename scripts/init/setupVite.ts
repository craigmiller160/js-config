import { either } from 'fp-ts';
import { PackageJson } from '../files/PackageJson';

export const VITE_CONFIG = `
import { defineConfig } from '@craigmiller160/js-config/configs/vite/vite.config';

export default defineConfig();
`;

export const setupVite = (
	cwd: string,
	packageJson: PackageJson
): either.Either<Error, unknown> => {
	throw new Error();
};
