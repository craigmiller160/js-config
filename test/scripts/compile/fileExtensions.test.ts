import { describe, it } from 'vitest';

describe('compile file extension utilities', () => {
	describe('fixFileExtension', () => {
		it.fails('.d.ts');
		it.fails('.d.mts');
		it.fails('.d.cts');
		it.fails('.ts');
		it.fails('.mts');
		it.fails('.cts');
		it.fails('.tsx');
		it.fails('.js');
		it.fails('.mjs');
		it.fails('.cjs');
		it.fails('.jsx');
	});

	describe('fixTypeFileExtensions', () => {
		it.fails('fixes all type file extensions');
	});
});
