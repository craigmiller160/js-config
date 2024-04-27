import { MockedFunction, vi, test } from 'vitest';
import { RunCommandSync } from '../../src/scripts/utils/runCommand';

const mockRunCommandSync: MockedFunction<RunCommandSync> = vi.fn();

test('generates types for css & scss files', () => {
    throw new Error();
});