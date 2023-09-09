import { either, function as func } from 'fp-ts';
import { PackageJson, PackageJsonType } from '../files/PackageJson';
import { logger } from '../logger';
import fs from 'fs';
import path from 'path';
import { match } from 'ts-pattern';
import {vi} from 'vitest';

export const VITE_CONFIG = `
import { defineConfig } from '@craigmiller160/js-config/configs/vite/vite.config';

export default defineConfig();
`;

const getViteConfigPath = (cwd: string, type: PackageJsonType): string => {
	if (type === 'commonjs') {
		return 'vite.config.mts';
	}
	return 'vite.config.ts';
};

const backupExistingFile = (
	cwd: string,
	viteConfigPath: string
): either.Either<Error, unknown> => {
	if (!fs.existsSync(viteConfigPath)) {
		return either.right(func.constVoid());
	}

	const existingConfig = fs.readFileSync(viteConfigPath, 'utf8');
	if (existingConfig.includes('@craigmiller160/js-config')) {
		return either.right(func.constVoid());
	}

	logger.debug('Backing up old vite config');
	fs.writeFileSync(path.join(cwd, 'vite.config.backup'), existingConfig);
};

export const setupVite = (
	cwd: string,
	packageJson: PackageJson
): either.Either<Error, unknown> => {
	logger.info('Setting up Vite');
	const viteConfigPath = getViteConfigPath(
		cwd,
		packageJson.type ?? 'commonjs'
	);
	backupExistingFile(cwd, viteConfigPath);
	throw new Error();
};
