import { beforeEach, describe, it, MockedFunction, vi, expect } from 'vitest';
import path from 'path';
import { CYPRESS } from '../../src/scripts/commandPaths';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import { either, taskEither } from 'fp-ts';
import { execute } from '../../src/scripts/c-cypress-dev';
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

describe('c-cypress-dev', () => {
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
			`${COMMAND} open -C ${CONFIG}`
		);
	});
});
