import { describe, expect, it } from 'vitest';
import path from 'path';
import { getProjectRoot } from '../src/root';

const WORKING_DIR = path.join(
    process.cwd(),
    'test',
    '__working_directories__',
    'root'
);

describe('root', () => {
    describe('getProjectRoot', () => {
        it('is source path', () => {
            const currentDir = path.join(WORKING_DIR, 'src', 'child');
            const result = getProjectRoot(currentDir);
            expect(result).toEqual(WORKING_DIR);
        });

        it('is build path', () => {
            const currentDir = path.join(
                WORKING_DIR,
                'lib',
                'child',
                'grandchild'
            );
            const result = getProjectRoot(currentDir);
            expect(result).toEqual(WORKING_DIR);
        });
    });
});
