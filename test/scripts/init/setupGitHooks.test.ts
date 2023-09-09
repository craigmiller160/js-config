import { describe, it } from 'vitest';

describe('setupGitHooks', () => {
	it.fails('does nothing when no .git directory');
	it.fails('aborts if .huksy directory not created');
	it.fails('fully sets up git hooks');
});
