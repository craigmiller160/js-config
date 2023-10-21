import {
	IsLibraryPresent,
	isLibraryPresent as realIsLibraryPresent
} from '../utils/library';
import { logger } from '../logger';

const REACT_PLUGINS: ReadonlyArray<string> = [
	'plugin:react/recommended',
	'plugin:react-hooks/recommended',
	'plugin:jsx-a11y/recommended',
	'plugin:react/jsx-runtime'
];

const REACT_TESTING_LIBRARY_PLUGINS: ReadonlyArray<string> = [
	'plugin:testing-library/react'
];

const TESTING_LIBRARY_PLUGINS: ReadonlyArray<string> = [
	'plugin:testing-library/dom',
	'plugin:jest-dom/recommended'
];

const VITEST_PLUGINS: ReadonlyArray<string> = ['plugin:vitest/recommended'];

const CYPRESS_PLUGINS: ReadonlyArray<string> = ['plugin:cypress/recommended'];
const TANSTACK_QUERY_PLUGINS: ReadonlyArray<string> = [
	'plugin:@tanstack/eslint-plugin-query/recommended'
];

export const setupEslintPlugins = (
	isLibraryPresent: IsLibraryPresent = realIsLibraryPresent
): ReadonlyArray<string> => {
	logger.info('Setting up eslint plugins');
	const plugins: ReadonlyArray<ReadonlyArray<string>> = [
		isLibraryPresent('react') ? REACT_PLUGINS : [],
		isLibraryPresent('vitest') ? VITEST_PLUGINS : [],
		isLibraryPresent('@testing-library/jest-dom')
			? TESTING_LIBRARY_PLUGINS
			: [],
		isLibraryPresent('cypress') ? CYPRESS_PLUGINS : [],
		isLibraryPresent('@testing-library/react')
			? REACT_TESTING_LIBRARY_PLUGINS
			: [],
		isLibraryPresent('@tanstack/react-query') ? TANSTACK_QUERY_PLUGINS : []
	];
	return plugins.flat();
};
