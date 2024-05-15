import { describe, it, expect } from 'vitest';
import { IsLibraryPresent } from '../../../src/scripts/utils/library';
import { setupEslintPlugins } from '../../../src/scripts/init/setupEslintPlugins';
import { EslintPlugins } from '../../../src/scripts/files/ControlFile';

const createIsLibraryPresent =
    (presentLibraries: ReadonlyArray<string>): IsLibraryPresent =>
    (library: string): boolean =>
        presentLibraries.includes(library);

describe('setupEslintPlugins', () => {
    it('adds react plugins', () => {
        const isLibraryPresent = createIsLibraryPresent(['react']);
        const result = setupEslintPlugins(isLibraryPresent);
        expect(result).toEqual<EslintPlugins>({
            react: true,
            testingLibraryReact: false,
            tanstackQuery: false,
            jestDom: false,
            cypress: false,
            vitest: false
        });
    });

    it('adds vitest plugins', () => {
        const isLibraryPresent = createIsLibraryPresent(['vitest']);
        const result = setupEslintPlugins(isLibraryPresent);
        expect(result).toEqual<EslintPlugins>({
            react: false,
            testingLibraryReact: false,
            tanstackQuery: false,
            jestDom: false,
            cypress: false,
            vitest: true
        });
    });

    it('adds testing library plugins', () => {
        const isLibraryPresentJestDom = createIsLibraryPresent([
            '@testing-library/jest-dom'
        ]);
        const jestDomResult = setupEslintPlugins(isLibraryPresentJestDom);
        expect(jestDomResult).toEqual<EslintPlugins>({
            react: false,
            testingLibraryReact: false,
            tanstackQuery: false,
            jestDom: true,
            cypress: false,
            vitest: false
        });
    });

    it('adds react testing library plugins', () => {
        const isLibraryPresentReact = createIsLibraryPresent([
            '@testing-library/react'
        ]);
        const reactResult = setupEslintPlugins(isLibraryPresentReact);
        expect(reactResult).toEqual<EslintPlugins>({
            react: false,
            testingLibraryReact: true,
            tanstackQuery: false,
            jestDom: false,
            cypress: false,
            vitest: false
        });
    });

    it('adds cypress plugins', () => {
        const isLibraryPresent = createIsLibraryPresent(['cypress']);
        const result = setupEslintPlugins(isLibraryPresent);
        expect(result).toEqual<EslintPlugins>({
            react: false,
            testingLibraryReact: false,
            tanstackQuery: false,
            jestDom: false,
            cypress: true,
            vitest: false
        });
    });

    it('adds tanstack query plugins', () => {
        const isLibraryPresent = createIsLibraryPresent([
            '@tanstack/react-query'
        ]);
        const result = setupEslintPlugins(isLibraryPresent);
        expect(result).toEqual<EslintPlugins>({
            react: false,
            testingLibraryReact: false,
            tanstackQuery: true,
            jestDom: false,
            cypress: false,
            vitest: false
        });
    });
});
