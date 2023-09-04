import {describe, expect, it} from 'vitest';
import path from 'path';
import {isLibraryPresent} from '../../../scripts/utils/library';

const WORKING_DIR = path.join(process.cwd(), 'test', '__working_directories__', 'isLibraryPresent');

describe('library', () => {
    describe('isLibraryPresent', () => {
        it('is present, using the CWD and string', () => {
            const result = isLibraryPresent(path.join(WORKING_DIR, 'package.json'), 'my-lib');
            expect(result).toEqual(true);
        })

        it('is not present, using the CWD and string', () => {
            const result = isLibraryPresent(path.join(WORKING_DIR, 'package.json'), 'my-lib2');
            expect(result).toEqual(false);
        })

        it('is present, using full PackageJson and string', () => {
            throw new Error();
        })

        it('is not present, using full PackageJson and string', () => {
            throw new Error();
        })

        it('is present, using full PackageJson and regex', () => {
            throw new Error();
        })

        it('is not present, using full PackageJson and regex', () => {
            throw new Error();
        })
    });
})