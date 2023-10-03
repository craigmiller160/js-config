import { beforeEach, describe, it } from 'vitest';
import path from 'path';
import fs from 'fs/promises';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'compile'
);
const OUT_DIR = path.join(WORKING_DIR, 'out');

describe('compile file', () => {
	beforeEach(async () => {
		await fs
			.readdir(OUT_DIR)
			.then((files) =>
				files
					.filter((file) => '.gitkeep' !== file)
					.map((file) => fs.rm(path.join(OUT_DIR, file)))
			)
			.then((promises) => Promise.all(promises));
	});

	it.fails('compiles ts file with esmodules');
	it.fails('compiles ts file with commonjs');
	it.fails('compiles js file with esmodules');
	it.fails('compiles js file with commonjs');
});
