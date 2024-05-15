import { describe, it, expect } from 'vitest';
import path from 'path';
import { walk } from '../../../src/scripts/utils/files';

const WORKING_DIR = path.join(
    process.cwd(),
    'test',
    '__working_directories__',
    'fileWalk'
);

describe('files', () => {
    describe('walk', () => {
        it('walks file tree', async () => {
            const results = await walk(WORKING_DIR);
            expect(results).toEqual([
                path.join(WORKING_DIR, 'child1', 'child1.txt'),
                path.join(WORKING_DIR, 'child1', 'child1b.txt'),
                path.join(
                    WORKING_DIR,
                    'child1',
                    'grandchild1',
                    'grandchild1.txt'
                ),
                path.join(WORKING_DIR, 'child2', 'child2.txt'),
                path.join(WORKING_DIR, 'root.txt')
            ]);
        });
    });
});
