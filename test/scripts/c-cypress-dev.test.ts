import {beforeEach, describe, it, MockedFunction, vi} from 'vitest';
import path from 'path';
import { CYPRESS } from '../../scripts/commandPaths';
import { runCommandSync } from '../../scripts/utils/runCommand';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const COMMAND = path.join(process.cwd(), 'node_modules', CYPRESS);

describe('c-cypress-dev', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it.fails('runs command');
});
