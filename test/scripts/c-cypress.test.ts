import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import path from 'path';
import { CYPRESS } from '../../src/scripts/commandPaths';
import { either, taskEither } from 'fp-ts';
import { execute } from '../../src/scripts/c-cypress';
import { compileAndGetCypressConfig } from '../../src/scripts/cypress';

vi.mock('../../src/scripts/cypress', () => ({
	compileAndGetCypressConfig: vi.fn()
}));

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;
const compileAndGetCypressConfigMock =
	compileAndGetCypressConfig as MockedFunction<
		typeof compileAndGetCypressConfig
	>;

const COMMAND = path.join(process.cwd(), 'node_modules', CYPRESS);
const CONFIG = path.join(process.cwd(), 'cypress.config.js');

describe('c-cypress', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it('runs command', async () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		compileAndGetCypressConfigMock.mockReturnValue(
			taskEither.right(CONFIG)
		);
		await execute(process);

		expect(runCommandSyncMock).toHaveBeenCalledWith(
			`${COMMAND} run --component -b chrome -C ${CONFIG}`
		);
	});
});
