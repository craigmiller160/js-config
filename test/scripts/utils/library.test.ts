import {describe, expect, it} from 'vitest';
import path from 'path';
import {isLibraryPresent} from '../../../scripts/utils/library';
import {PackageJson} from '../../../scripts/utils/PackageJson';

const WORKING_DIR = path.join(process.cwd(), 'test', '__working_directories__', 'isLibraryPresent');

const packageJson: PackageJson = {
    name: 'my-project',
    version: '1.0.0',
    dependencies: {
        myLib: '1.0.0'
    },
    devDependencies: {
        myOtherLib: '2.0.0'
    }
}

describe('library', () => {
    describe('isLibraryPresent', () => {
        it('is present, using the CWD and string', () => {
            const result = isLibraryPresent(WORKING_DIR, 'my-lib');
            expect(result).toEqual(true);
        })

        it('is not present, using the CWD and string', () => {
            const result = isLibraryPresent(WORKING_DIR, 'my-lib2');
            expect(result).toEqual(false);
        })

        it('is present, using full PackageJson and string', () => {
            const result = isLibraryPresent(packageJson, 'myLib');
            expect(result).toEqual(true);
        })

        it('is not present, using full PackageJson and string', () => {
            const result = isLibraryPresent(packageJson, 'myLib2');
            expect(result).toEqual(false);
        })

        it('is present, using full PackageJson and regex', () => {
            const result = isLibraryPresent(packageJson, /^myOther.*$/);
            expect(result).toEqual(true);
        })

        it('is not present, using full PackageJson and regex', () => {
            const result = isLibraryPresent(packageJson, /^myOther2.*$/);
            expect(result).toEqual(false);
        })
    });
})