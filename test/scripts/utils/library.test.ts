import { describe, it, expect } from 'vitest';
import { isLibraryPresent } from '../../../scripts/utils/library';

describe('library', () => {
	describe('isLibraryPresent', () => {
		it('is present', () => {
			expect(isLibraryPresent('typescript')).toEqual(true);
		});

		it('is not present', () => {
			expect(isLibraryPresent('foobar')).toEqual(false);
		});
	});
});
