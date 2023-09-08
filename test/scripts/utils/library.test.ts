import { describe, it, expect } from 'vitest';
import { isLibraryPresent } from '../../../scripts/utils/library';

describe('library', () => {
	describe('isLibraryPresent', () => {
		it('is present', () => {
			expect(isLibraryPresent('typescript')).toBe(true);
		});

		it('is not present', () => {
			expect(isLibraryPresent('foobar')).toBe(false);
		});
	});
});
