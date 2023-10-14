import { afterEach, beforeEach, describe, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'compileCypress'
);

const FILES_TO_KEEP = ['node_modules', '.gitignore', '.gitkeep'];

const clean = (): Promise<unknown> => {
	const rootPromise = fs
		.readdir(WORKING_DIR)
		.then((files) =>
			files
				.filter((file) => !FILES_TO_KEEP.includes(file))
				.map((file) => path.join(WORKING_DIR, file))
				.map((file) => fs.rm(file))
		)
		.then(Promise.all);
	const nodeModulesDir = path.join(WORKING_DIR, 'node_modules');
	const nodeModulesPromise = fs
		.readdir(nodeModulesDir)
		.then((files) =>
			files
				.filter((file) => !FILES_TO_KEEP.includes(file))
				.map((file) => path.join(nodeModulesDir, file))
				.map((file) => fs.rm(file))
		)
		.then(Promise.all);
	return Promise.all([rootPromise, nodeModulesPromise]);
};

describe('compile cypress config', () => {
	beforeEach(async () => {
		await clean();
	});

	afterEach(async () => {
		await clean();
	});

	it.fails('compiles cypress.config.ts');
	it.fails('compiles cypress.config.mts');
	it.fails('compiles cypress.config.cts');
	it.fails('compiles cypress.config.js');
	it.fails('compiles cypress.config.mjs');
	it.fails('compiles cypress.config.cjs');
});
