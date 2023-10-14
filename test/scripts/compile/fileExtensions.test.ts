import { beforeEach, describe, it, expect, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import {
	fixFileExtension,
	fixTypeFileExtensions
} from '../../../src/scripts/compile/fileExtensions';

const TYPE_EXTENSION_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'fileExtensions',
	'types'
);

const cleanup = () =>
	fs
		.readdir(TYPE_EXTENSION_DIR)
		.then((files) =>
			files
				.filter((file) => '.gitkeep' !== file)
				.map((file) => path.join(TYPE_EXTENSION_DIR, file))
				.map((file) => fs.rm(file))
		)
		.then((promises) => Promise.all(promises));

describe('compile file extension utilities', () => {
	beforeEach(async () => {
		await cleanup();
		await Promise.all([
			fs.writeFile(path.join(TYPE_EXTENSION_DIR, 'file1.d.ts'), ''),
			fs.writeFile(path.join(TYPE_EXTENSION_DIR, 'file2.d.mts'), ''),
			fs.writeFile(path.join(TYPE_EXTENSION_DIR, 'file3.d.cts'), '')
		]);
	});

	afterEach(async () => {
		await cleanup();
	});

	describe('fixFileExtension', () => {
		it('.d.ts', () => {
			const result = fixFileExtension('file.d.ts');
			expect(result).toBe('file.d.ts');
		});

		it('.d.mts', () => {
			const result = fixFileExtension('file.d.mts');
			expect(result).toBe('file.d.ts');
		});

		it('.d.cts', () => {
			const result = fixFileExtension('file.d.cts');
			expect(result).toBe('file.d.ts');
		});

		it('.ts', () => {
			const result = fixFileExtension('file.ts');
			expect(result).toBe('file.js');
		});

		it('.mts', () => {
			const result = fixFileExtension('file.mts');
			expect(result).toBe('file.js');
		});

		it('.cts', () => {
			const result = fixFileExtension('file.cts');
			expect(result).toBe('file.js');
		});

		it('.tsx', () => {
			const result = fixFileExtension('file.tsx');
			expect(result).toBe('file.jsx');
		});

		it('.js', () => {
			const result = fixFileExtension('file.js');
			expect(result).toBe('file.js');
		});

		it('.mjs', () => {
			const result = fixFileExtension('file.mjs');
			expect(result).toBe('file.js');
		});

		it('.cjs', () => {
			const result = fixFileExtension('file.cjs');
			expect(result).toBe('file.js');
		});

		it('.jsx', () => {
			const result = fixFileExtension('file.jsx');
			expect(result).toBe('file.jsx');
		});
	});

	describe('fixTypeFileExtensions', () => {
		it('fixes all type file extensions', async () => {
			const result = await fixTypeFileExtensions(TYPE_EXTENSION_DIR)();
			expect(result).toBeRight();

			const files = (await fs.readdir(TYPE_EXTENSION_DIR))
				.filter((file) => '.gitkeep' !== file)
				.sort();
			expect(files).toHaveLength(3);
			expect(files).toEqual(['file1.d.ts', 'file2.d.ts', 'file3.d.ts']);
		});
	});
});
