import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import path from 'path';
import { setupGitHooks } from '../../../scripts/init/setupGitHooks';
import { runCommandSync } from '../../../scripts/utils/runCommand';
import fs from 'fs';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'setupGitHooks'
);

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

describe('setupGitHooks', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('does nothing when no .git directory', () => {
		const cwd = path.join(WORKING_DIR, 'noGit');
		setupGitHooks(cwd, process);
		const preCommitPath = path.join(cwd, '.husky', 'pre-commit');
		expect(fs.existsSync(preCommitPath)).toBe(false);
		expect(runCommandSyncMock).not.toHaveBeenCalled();
	});
	it.fails('aborts if .huksy directory not created');
	it.fails('fully sets up git hooks');
});
