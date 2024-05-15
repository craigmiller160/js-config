import { beforeEach, describe, it, MockedFunction, vi, expect } from 'vitest';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { either } from 'fp-ts';
import { execute } from '../../src/scripts/c-build-app';
import path from 'path';
import { VITE } from '../../src/scripts/commandPaths';

const runCommandSyncMock = runCommandSync as MockedFunction<
    typeof runCommandSync
>;
const COMMAND = path.join(process.cwd(), 'node_modules', VITE);

describe('c-build-app', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('runs vite build', () => {
        runCommandSyncMock.mockReturnValue(either.right(''));
        execute(process);

        expect(runCommandSyncMock).toHaveBeenCalledWith(`${COMMAND} build`);
    });
});
