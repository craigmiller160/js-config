import { IsLibraryPresent } from '../utils/library';
import { logger } from '../logger';
import { EslintPlugins } from '../files/ControlFile';
import { reader } from 'fp-ts';

export const setupEslintPlugins: reader.Reader<
	IsLibraryPresent,
	EslintPlugins
> = (isLibraryPresent) => {
	logger.info('Setting up eslint plugins');
	return {
		react: isLibraryPresent('react'),
		vitest: isLibraryPresent('vitest'),
		jestDom: isLibraryPresent('@testing-library/jest-dom'),
		cypress: isLibraryPresent('cypress'),
		testingLibraryReact: isLibraryPresent('@testing-library/react'),
		tanstackQuery: isLibraryPresent('@tanstack/react-query')
	};
};
