import {beforeEach, describe, it, MockedFunction, vi} from 'vitest';
import { runCommandSync } from '../../scripts/utils/runCommand';
import path from 'path';
import { CYPRESS } from '../../scripts/commandPaths';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const COMMAND = path.join(process.cwd(), 'node_modules', CYPRESS);

describe('c-cypress', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it.fails('runs command');
});
