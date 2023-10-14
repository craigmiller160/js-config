import { afterEach, beforeEach, describe, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'compileCypress'
);

const clean = (): Promise<unknown> =>
	fs
		.readdir(WORKING_DIR)
		.then((files) =>
			files
				.filter((file) => file !== '.gitkeep')
				.map((file) => path.join(WORKING_DIR, file))
				.map((file) => fs.rm(file))
		)
		.then(Promise.all);

describe('compile cypress config', () => {
	beforeEach(async () => {
		await clean();
	});

	afterEach(async () => {
		await clean();
	});

	it.fails('compiles cypress config');
});
