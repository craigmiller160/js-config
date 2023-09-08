const REACT_PLUGINS: ReadonlyArray<string> = [
	'plugin:react/recommended',
	'plugin:react-hooks/recommended',
	'plugin:jsx-a11y/recommended'
];

const TESTING_LIBRARY_PLUGINS: ReadonlyArray<string> = [
	'plugin:testing-library/recommended',
	'plugin:jest-dom/recommended'
];

const VITEST_PLUGINS: ReadonlyArray<string> = [
    'plugin:vitest/recommended'
];

const CYPRESS_PLUGINS: ReadonlyArray<string> = [
    'plugin:cypress/recommended'
];

export const setupEslintPlugins = (): ReadonlyArray<string> => {};
