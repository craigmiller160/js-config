import { describe, it, expect } from 'vitest';
import {packageJsonCodec, parsePackageJson} from '../../../scripts/utils/PackageJson';
import path from 'path';

const packageJsonDirectory = path.join(process.cwd(), 'test', '__working_directories__', 'PackageJson');

describe('PackageJson', () => {
    it('parses a valid package.json', () => {
        const result = parsePackageJson(path.join(packageJsonDirectory, 'valid.json'));
        expect(result).toEqualRight({
            name: 'TheName',
            version: '1.0.0'
        });
    });

    it('returns errors for invalid package.json', () => {
        const result = parsePackageJson(path.join(packageJsonDirectory, 'invalid.json'));
        expect(result).toEqualLeft(new Error('Expecting string at name but instead got: 12; Expecting string at version but instead got: 13'));
    });
});