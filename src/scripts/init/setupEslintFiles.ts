import { either, function as func } from 'fp-ts';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';
import { PackageJson, PackageJsonType } from '../files/PackageJson';

const getEslintConfigPath = (cwd: string, type: PackageJsonType): string => {
	if (type === 'commonjs') {
		return path.join(cwd, 'eslint.config.mjs');
	}
	return path.join(cwd, 'eslint.config.js');
};
const getPrettierrcPath = (cwd: string, type: PackageJsonType): string => {
	if (type === 'commonjs') {
		return path.join(cwd, '.prettierrc.js');
	}
	return path.join(cwd, '.prettierrc.cjs');
};

const shouldWriteConfig = (configPath: string): boolean => {
	if (fs.existsSync(configPath)) {
		const config = fs.readFileSync(configPath, 'utf8');
		return !config.includes('@craigmiller160/js-config');
	}
	return true;
};

const writeEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): either.Either<Error, void> =>
	either.tryCatch(() => {
		const eslintConfigPath = getEslintConfigPath(cwd, packageJson.type);
		if (shouldWriteConfig(eslintConfigPath)) {
			fs.writeFileSync(
				eslintConfigPath,
				`export { default } from '@craigmiller160/js-config/configs/eslint/eslint.config.mjs';`
			);
		}

		const prettierrcPath = getPrettierrcPath(cwd, packageJson.type);
		if (shouldWriteConfig(prettierrcPath)) {
			fs.writeFileSync(
				prettierrcPath,
				`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
			);
		}
	}, either.toError);

export const setupEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): either.Either<Error, void> => {
	logger.info('Setting up eslint files');
	return func.pipe(
		writeEslintFiles(cwd, packageJson),
		either.chain(() => removeInvalidEslintFiles(cwd, packageJson))
	);
};
