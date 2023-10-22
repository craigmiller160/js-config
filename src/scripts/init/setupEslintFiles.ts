import { either, function as func } from 'fp-ts';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';
import { PackageJson, PackageJsonType } from '../files/PackageJson';
import { unknownToError } from '../utils/unknownToError';

const getEslintrcPath = (cwd: string, type: PackageJsonType): string => {
	if (type === 'commonjs') {
		return path.join(cwd, '.eslintrc.js');
	}
	return path.join(cwd, '.eslintrc.cjs');
};
const getPrettierrcPath = (cwd: string, type: PackageJsonType): string => {
	if (type === 'commonjs') {
		return path.join(cwd, '.prettierrc.js');
	}
	return path.join(cwd, '.prettierrc.cjs');
};

const getRemoveEslintrcPath = (cwd: string, type: PackageJsonType): string => {
	if (type === 'commonjs') {
		return path.join(cwd, '.eslintrc.cjs');
	}
	return path.join(cwd, '.eslintrc.js');
};

const getRemovePrettierrcPath = (
	cwd: string,
	type: PackageJsonType
): string => {
	if (type === 'commonjs') {
		return path.join(cwd, '.prettierrc.cjs');
	}
	return path.join(cwd, '.prettierrc.js');
};

const shouldWriteConfig = (configPath: string): boolean => {
	if (fs.existsSync(configPath)) {
		const config = fs.readFileSync(configPath, 'utf8');
		return !config.includes('@craigmiller160/js-config');
	}
	return true;
};

const removeInvalidEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): either.Either<Error, void> =>
	either.tryCatch(() => {
		const removeEslintrcPath = getRemoveEslintrcPath(cwd, packageJson.type);
		if (fs.existsSync(removeEslintrcPath)) {
			logger.debug(
				`Removing invalid eslintrc file: ${removeEslintrcPath}`
			);
			fs.rmSync(removeEslintrcPath);
		}

		const removePrettierrcPath = getRemovePrettierrcPath(
			cwd,
			packageJson.type
		);
		if (fs.existsSync(removePrettierrcPath)) {
			logger.debug(
				`Removing invalid prettierrc file: ${removePrettierrcPath}`
			);
			fs.rmSync(removePrettierrcPath);
		}
	}, unknownToError);

const writeEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): either.Either<Error, void> =>
	either.tryCatch(() => {
		const eslintrcPath = getEslintrcPath(cwd, packageJson.type);
		if (shouldWriteConfig(eslintrcPath)) {
			fs.writeFileSync(
				eslintrcPath,
				`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js');`
			);
		}

		const prettierrcPath = getPrettierrcPath(cwd, packageJson.type);
		if (shouldWriteConfig(prettierrcPath)) {
			fs.writeFileSync(
				prettierrcPath,
				`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
			);
		}
	}, unknownToError);

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
