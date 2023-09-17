import { either, function as func } from 'fp-ts';
import { parseStylelintrc, Stylelintrc } from '../files/Stylelintrc';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';
import { unknownToError } from '../utils/unknownToError';

const DEFAULT_CONFIG: Stylelintrc = {
	extends: '@craigmiller160/js-config/configs/stylelint/.stylelintrc.json',
	rules: undefined
};

const getStylelintrcPath = (cwd: string): string =>
	path.join(cwd, '.stylelintrc.json');

const shouldWriteStylelintrc = (cwd: string) => {
	const stylelintrcPath = getStylelintrcPath(cwd);
	if (fs.existsSync(stylelintrcPath)) {
		return func.pipe(
			parseStylelintrc(stylelintrcPath),
			either.map(
				(stylelintrc) =>
					!stylelintrc.extends.includes('@craigmiller160/js-config')
			),
			either.fold(() => true, func.identity)
		);
	}
	return true;
};

export const setupStylelint = (cwd: string): either.Either<Error, unknown> => {
	logger.info('Setting up stylelint');
	if (!shouldWriteStylelintrc(cwd)) {
		logger.debug('Stylelint already configured');
		return either.right(func.constVoid());
	}

	const stylelintrcPath = getStylelintrcPath(cwd);
	return either.tryCatch(
		() =>
			fs.writeFileSync(
				stylelintrcPath,
				JSON.stringify(DEFAULT_CONFIG, null, 2)
			),
		unknownToError
	);
};
