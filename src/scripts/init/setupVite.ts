import { either, function as func } from 'fp-ts';
import { PackageJson, PackageJsonType } from '../files/PackageJson';
import { logger } from '../logger';
import fs from 'fs';
import path from 'path';
import { unknownToError } from '../utils/unknownToError';

export const VITE_CONFIG = `
import { defineConfig } from '@craigmiller160/js-config/configs/vite/vite.config.mjs';

export default defineConfig();
`;

const getViteConfigPath = (cwd: string, type: PackageJsonType): string => {
	if (type === 'commonjs') {
		return path.join(cwd, 'vite.config.mts');
	}
	return path.join(cwd, 'vite.config.ts');
};

type ExistingFileType = 'invalid' | 'valid' | 'none';

const getExistingFileType = (
	viteConfigPath: string
): either.Either<Error, ExistingFileType> => {
	if (!fs.existsSync(viteConfigPath)) {
		return either.right('none');
	}

	return either.tryCatch((): ExistingFileType => {
		const existingConfig = fs.readFileSync(viteConfigPath, 'utf8');
		if (existingConfig.includes('@craigmiller160/js-config')) {
			return 'valid';
		}

		return 'invalid';
	}, unknownToError);
};

const backupExistingFile = (
	cwd: string,
	viteConfigPath: string,
	existingFileType: ExistingFileType
): either.Either<Error, unknown> =>
	either.tryCatch(() => {
		if (existingFileType === 'invalid') {
			logger.debug('Backing up old vite config');
			fs.renameSync(viteConfigPath, path.join(cwd, 'vite.config.backup'));
		}
	}, unknownToError);

const writeViteConfig = (
	cwd: string,
	viteConfigPath: string,
	existingFileType: ExistingFileType
): either.Either<Error, unknown> =>
	either.tryCatch(() => {
		if (existingFileType !== 'valid') {
			logger.debug('Writing new vite config');
			fs.writeFileSync(viteConfigPath, VITE_CONFIG.trim());
		} else {
			logger.debug('Valid vite config already exists');
		}
	}, unknownToError);

export const setupVite = (
	cwd: string,
	packageJson: PackageJson
): either.Either<Error, unknown> => {
	logger.info('Setting up Vite');
	const viteConfigPath = getViteConfigPath(cwd, packageJson.type);
	return func.pipe(
		getExistingFileType(viteConfigPath),
		either.chainFirst((existingFileType) =>
			backupExistingFile(cwd, viteConfigPath, existingFileType)
		),
		either.chainFirst((existingFileType) =>
			writeViteConfig(cwd, viteConfigPath, existingFileType)
		)
	);
};
