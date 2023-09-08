import {
	isLibraryPresent,
	isLibraryPresent as realIsLibraryPresent
} from '../utils/library';

const REACT_PLUGINS: ReadonlyArray<string> = [
	'plugin:react/recommended',
	'plugin:react-hooks/recommended',
	'plugin:jsx-a11y/recommended'
];

const TESTING_LIBRARY_PLUGINS: ReadonlyArray<string> = [
	'plugin:testing-library/recommended',
	'plugin:jest-dom/recommended'
];

const VITEST_PLUGINS: ReadonlyArray<string> = ['plugin:vitest/recommended'];

const CYPRESS_PLUGINS: ReadonlyArray<string> = ['plugin:cypress/recommended'];

type IsLibraryPresent = typeof realIsLibraryPresent;

const isTestingLibraryPresent = (isLibraryPresent: IsLibraryPresent): boolean =>
	isLibraryPresent('@testing-library/react') ||
	isLibraryPresent('@testing-library/jest-dom');

export const setupEslintPlugins = (
	isLibraryPresent: IsLibraryPresent = realIsLibraryPresent
): ReadonlyArray<string> => {
	const plugins: ReadonlyArray<ReadonlyArray<string>> = [
		isLibraryPresent('react') ? REACT_PLUGINS : [],
		isLibraryPresent('vitest') ? VITEST_PLUGINS : [],
		isTestingLibraryPresent(isLibraryPresent) ? TESTING_LIBRARY_PLUGINS : [],
		isLibraryPresent('cypress') ? CYPRESS_PLUGINS : []
	];
	return plugins.flat();
};
