import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import path from 'path';
import { setupGitHooks } from '../../../scripts/init/setupGitHooks';
import { runCommandSync } from '../../../scripts/utils/runCommand';
import fs from 'fs';
import { either } from 'fp-ts';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'setupGitHooks'
);

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;

const ensureGitDirectory = (cwd: string) => {
	const gitDir = path.join(cwd, '.git');
	if (fs.existsSync(gitDir)) {
		fs.rmSync(gitDir, {
			recursive: true,
			force: true
		});
	}

	fs.mkdirSync(gitDir);
};

describe('setupGitHooks', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('does nothing when no .git directory', () => {
		const cwd = path.join(WORKING_DIR, 'noGit');
		const result = setupGitHooks(cwd, process);
		expect(result).toBeRight();

		const preCommitPath = path.join(cwd, '.husky', 'pre-commit');
		expect(fs.existsSync(preCommitPath)).toBe(false);
		expect(runCommandSyncMock).not.toHaveBeenCalled();
	});

	it.fails('aborts if .husky directory not created');

	it('fully sets up git hooks', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		const cwd = path.join(WORKING_DIR, 'complete');
		ensureGitDirectory(cwd);
		const result = setupGitHooks(cwd, process);
		expect(result).toBeRight();

		const preCommitPath = path.join(cwd, '.husky', 'pre-commit');
		expect(fs.existsSync(preCommitPath)).toBe(true);
		expect(runCommandSyncMock).toHaveBeenCalledWith('husky install');
	});
});
