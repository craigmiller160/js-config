import { either } from 'fp-ts';
import path from 'path';
import fs from 'fs';

const getEslintrcPath = (cwd: string): string => path.join(cwd, '.eslintrc.js');
const getPrettierrcPath = (cwd: string): string =>
	path.join(cwd, '.prettierrc.js');

const shouldWriteConfig = (configPath: string): boolean => {
	if (fs.existsSync(configPath)) {
		const config = fs.readFileSync(configPath, 'utf8');
		return !config.includes('@craigmiller160/js-config');
	}
	return true;
};

export const setupEslintFiles = (cwd: string): either.Either<Error, void> => {
	const eslintrcPath = getEslintrcPath(cwd);
	if (shouldWriteConfig(eslintrcPath)) {
		fs.writeFileSync(
			eslintrcPath,
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js');`
		);
	}

	const prettierrcPath = getPrettierrcPath(cwd);
	if (shouldWriteConfig(prettierrcPath)) {
		fs.writeFileSync(
			prettierrcPath,
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	}
};
