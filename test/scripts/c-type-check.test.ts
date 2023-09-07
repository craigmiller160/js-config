import {beforeEach, describe, it, MockedFunction, vi, expect} from 'vitest';
import { runCommandSync } from '../../scripts/utils/runCommand';
import path from 'path';
import {execute} from '../../scripts/c-type-check';

const runCommandSyncMock = runCommandSync as MockedFunction<typeof runCommandSync>;
const WORKING_DIR = path.join(process.cwd(), 'test', '__working_directories__', 'typeCheck');

describe('c-type-check', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    })
    it('runs the base type check only', () => {
        const cwd = path.join(WORKING_DIR, 'baseOnly');
        execute({
            ...process,
            cwd: () => cwd
        });
        expect(runCommandSyncMock).toHaveBeenCalledTimes(1);
        expect(runCommandSyncMock).toHaveBeenNthCalledWith(1, 'tsc --noEmit');
    })

    it('runs the type check once using the test config', () => {
        throw new Error();
    });

    it('runs the type check twice, using the base config and cypress config', () => {
        throw new Error();
    })
});