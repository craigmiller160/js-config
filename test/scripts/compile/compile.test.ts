import { describe, it } from 'vitest';

describe('compile file', () => {
	it.fails('compiles ts file with esmodules');
	it.fails('compiles ts file with commonjs');
	it.fails('compiles js file with esmodules');
	it.fails('compiles js file with commonjs');
});
