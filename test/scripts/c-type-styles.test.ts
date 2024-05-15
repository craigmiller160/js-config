import { MockedFunction, vi, test, beforeEach, expect } from 'vitest';
import { RunCommandSync } from '../../src/scripts/utils/runCommand';
import { execute } from '../../src/scripts/c-type-styles';
import { either } from 'fp-ts';
import {
    TYPED_CSS_MODULES,
    TYPED_SCSS_MODULES
} from '../../src/scripts/commandPaths';
import path from 'path';

const mockRunCommandSync: MockedFunction<RunCommandSync> = vi.fn();

beforeEach(() => {
    vi.resetAllMocks;
});

test('generates types for css & scss files', () => {
    mockRunCommandSync.mockReturnValue(either.right(''));
    execute({
        process,
        runCommandSync: mockRunCommandSync
    });

    const cssCmd = path.join(process.cwd(), 'node_modules', TYPED_CSS_MODULES);
    const scssCmd = path.join(
        process.cwd(),
        'node_modules',
        TYPED_SCSS_MODULES
    );

    expect(mockRunCommandSync).toHaveBeenCalledTimes(2);
    expect(mockRunCommandSync).toHaveBeenNthCalledWith(
        1,
        `${cssCmd} -p src/**/*.module.css`
    );
    expect(mockRunCommandSync).toHaveBeenNthCalledWith(
        2,
        `${scssCmd} src/**/*.module.scss`
    );
});
