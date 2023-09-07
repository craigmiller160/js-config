import { describe, it, expect } from 'vitest';
import path from 'path';
import {findCommand} from '../../../scripts/utils/command';
import * as worker_threads from 'worker_threads';

const WORKING_DIR = path.join(process.cwd(), 'test', '__working_directories__', 'command');

const NODE_PATH: string = [
    '.pnpm/js-config-root/node_modules/@craigmiller160/js-config/build/bin/node_modules',
    '.pnpm/js-config-root/node_modules/@craigmiller160/js-config/build/node_modules',
    '.pnpm/js-config-root/node_modules/@craigmiller160/js-config/node_modules',
    '.pnpm/js-config-root/node_modules/@craigmiller160/node_modules',
    '.pnpm/js-config-root/node_modules',
    '.pnpm/node_modules'
]
    .map((thePath) => path.join(WORKING_DIR, thePath))
    .join(':');

describe('command', () => {
    describe('findCommand', () => {
        it('finds command from NODE_PATH', () => {
            const result = findCommand({
                ...process,
                env: {
                    NODE_PATH
                }
            }, 'typescript/bin/tsc');
            expect(result).toEqualRight(path.join(NODE_PATH[3], 'typescript/bin/tsc'));
        });

        it('cannot find command from NODE_PATH', () => {
            const result = findCommand({
                ...process,
                env: {
                    NODE_PATH
                }
            }, 'foo/bar');
            expect(result).toEqualLeft(new Error('Unable to find command on NODE_PATH: foo/bar'));
        });
    });
})