import { describe, it, expect, vi } from 'vitest';
import {
	runCommandAsync,
	runCommandSync
} from '../../../src/scripts/utils/runCommand';
import { either } from 'fp-ts';

vi.unmock('../../../src/scripts/utils/runCommand');

describe('runCommand', () => {
	describe('runCommandAsync', () => {
		it('runs command successfully with default options', async () => {
			const result = await runCommandAsync('ls -l package.json', {
				stdio: 'pipe'
			})();
			expect(result).toBeRight();
			const value = (result as either.Right<string>).right;
			expect(value.trim().endsWith('package.json')).toBe(true);
		});

		it('runs command with error with default options', async () => {
			const result = await runCommandAsync('ls -l package.json2', {
				stdio: 'pipe'
			})();
			expect(result).toEqualLeft(
				new Error(
					`Command failed. Status: 1 Message: ls: package.json2: No such file or directory`
				)
			);
		});
	});

	describe('runCommandSync', () => {
		it('runs command successfully with default options', () => {
			const result = runCommandSync('ls -l package.json', {
				stdio: 'pipe'
			});
			expect(result).toBeRight();
			const value = (result as either.Right<string>).right;
			expect(value.trim().endsWith('package.json')).toBe(true);
		});

		it('runs command with error with default options', () => {
			const result = runCommandSync('ls -l package.json2', {
				stdio: 'pipe'
			});
			expect(result).toEqualLeft(
				new Error(
					`Command failed. Status: 1 Message: ls: package.json2: No such file or directory\n`
				)
			);
		});
	});
});
