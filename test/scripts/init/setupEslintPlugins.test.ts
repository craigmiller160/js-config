import { describe, it, expect } from 'vitest';
import { IsLibraryPresent } from '../../../scripts/utils/library';
import { setupEslintPlugins } from '../../../scripts/init/setupEslintPlugins';

const createIsLibraryPresent =
	(presentLibraries: ReadonlyArray<string>): IsLibraryPresent =>
	(library: string): boolean =>
		presentLibraries.includes(library);

describe('setupEslintPlugins', () => {
	it('adds react plugins', () => {
		const isLibraryPresent = createIsLibraryPresent(['react']);
		const result = setupEslintPlugins(isLibraryPresent);
		expect(result).toEqual([
			'plugin:react/recommended',
			'plugin:react-hooks/recommended',
			'plugin:jsx-a11y/recommended'
		]);
	});

	it('adds vitest plugins', () => {
		const isLibraryPresent = createIsLibraryPresent(['vitest']);
		const result = setupEslintPlugins(isLibraryPresent);
		expect(result).toEqual(['plugin:vitest/recommended']);
	});

	it('adds testing library plugins', () => {
		const expectedResult: ReadonlyArray<string> = [
			'plugin:testing-library/recommended',
			'plugin:jest-dom/recommended'
		];

		const isLibraryPresentReact = createIsLibraryPresent([
			'@testing-library/react'
		]);
		const reactResult = setupEslintPlugins(isLibraryPresentReact);
		expect(reactResult).toEqual(expectedResult);

		const isLibraryPresentJestDom = createIsLibraryPresent([
			'@testing-library/jest-dom'
		]);
		const jestDomResult = setupEslintPlugins(isLibraryPresentJestDom);
		expect(jestDomResult).toEqual(expectedResult);
	});

	it('adds cypress plugins', () => {
		const isLibraryPresent = createIsLibraryPresent(['cypress']);
		const result = setupEslintPlugins(isLibraryPresent);
		expect(result).toEqual(['plugin:cypress/recommended']);
	});
});
