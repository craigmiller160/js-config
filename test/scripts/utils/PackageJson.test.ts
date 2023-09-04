import { describe, it, expect } from 'vitest';
import {packageJsonCodec} from '../../../scripts/utils/PackageJson';

describe('PackageJson', () => {
    it('parses a valid package.json', () => {
        const json = {
            name: 'TheName',
            version: '1.0.0'
        }
        const result = packageJsonCodec.decode(json);
        expect(result).toEqualRight(json);
    });

    it('returns errors for invalid package.json', () => {
        throw new Error();
    });
});