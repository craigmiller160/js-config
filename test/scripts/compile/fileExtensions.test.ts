import { beforeEach, describe, it } from 'vitest';
import path from 'path';
import fs from 'fs/promises';

const TYPE_EXTENSION_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'fileExtensions',
	'types'
);

describe('compile file extension utilities', () => {
	beforeEach(async () => {
		await fs
			.readdir(TYPE_EXTENSION_DIR)
			.then((files) =>
				files
					.filter((file) => '.gitkeep' !== file)
					.map((file) => path.join(TYPE_EXTENSION_DIR, file))
					.map((file) => fs.rm(file))
			)
			.then((promises) => Promise.all(promises));
		await Promise.all([
			fs.writeFile(path.join(TYPE_EXTENSION_DIR, 'file.d.ts'), ''),
			fs.writeFile(path.join(TYPE_EXTENSION_DIR, 'file.d.mts'), ''),
			fs.writeFile(path.join(TYPE_EXTENSION_DIR, 'file.d.cts'), '')
		]);
	});

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
