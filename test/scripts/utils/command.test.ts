import { describe, it } from 'vitest';

const NODE_PATH = [
    '.pnpm/js-config-root/node_modules/@craigmiller160/js-config/build/bin/node_modules',
    '.pnpm/js-config-root/node_modules/@craigmiller160/js-config/build/node_modules',
    '.pnpm/js-config-root/node_modules/@craigmiller160/js-config/node_modules',
    '.pnpm/js-config-root/node_modules/@craigmiller160/node_modules',
    '.pnpm/js-config-root/node_modules',
    '.pnpm/node_modules'
];

describe('command', () => {
    describe('findCommand', () => {
        it('finds command from NODE_PATH', () => {
            throw new Error();
        });

        it('cannot find command from NODE_PATH', () => {
            throw new Error();
        });
    });
})