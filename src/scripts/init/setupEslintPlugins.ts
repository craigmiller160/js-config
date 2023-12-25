import {
	IsLibraryPresent,
	isLibraryPresent as realIsLibraryPresent
} from '../utils/library';
import { logger } from '../logger';
import { EslintPlugins } from '../files/ControlFile';

export const setupEslintPlugins = (
	isLibraryPresent: IsLibraryPresent = realIsLibraryPresent
): EslintPlugins => {
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
