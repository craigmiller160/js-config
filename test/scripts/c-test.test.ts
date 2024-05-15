import { beforeEach, describe, it, MockedFunction, vi, expect } from 'vitest';
import { execute } from '../../src/scripts/c-test';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { either } from 'fp-ts';
import path from 'path';
import { VITEST } from '../../src/scripts/commandPaths';

const runCommandSyncMock = runCommandSync as MockedFunction<
    typeof runCommandSync
>;

const VITEST_PATH = path.join(process.cwd(), 'node_modules', VITEST);

describe('c-test', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('runs command for tests', () => {
        runCommandSyncMock.mockReturnValue(either.right(''));
        execute(process);
        expect(runCommandSyncMock).toHaveBeenCalledWith(`${VITEST_PATH} run`);
    });
});
