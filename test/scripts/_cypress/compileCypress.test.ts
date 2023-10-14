import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { compileAndGetCypressConfig } from '../../../src/scripts/cypress';
import { createCjsContent } from '../../testutils/compiledContent';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'compileCypress'
);
const OUTPUT_PATH = path.join(WORKING_DIR, 'node_modules', 'cypress.config.js');

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

type FileType = 'js' | 'ts';
const createCypressConfig = async (
	fileName: string,
	fileType: FileType
): Promise<void> => {
	const type = fileType === 'ts' ? ':string' : '';
	const content = `/* eslint-disable */
export const hello${type} = 'world';`;
	const filePath = path.join(WORKING_DIR, fileName);
	await fs.writeFile(filePath, content);
	await fs.stat(filePath);
};

const CJS_CONTENT = createCjsContent('hello', 'world');

describe('compile cypress config', () => {
	beforeEach(async () => {
		await clean();
	});

	afterEach(async () => {
		await clean();
	});

	it('compiles cypress.config.ts', async () => {
		await createCypressConfig('cypress.config.ts', 'ts');
		await compileAndGetCypressConfig({
			...process,
			cwd: () => WORKING_DIR
		})();
		const content = await fs.readFile(OUTPUT_PATH, 'utf8');
		expect(content).toEqual(CJS_CONTENT);
	});
	it.fails('compiles cypress.config.mts');
	it.fails('compiles cypress.config.cts');
	it.fails('compiles cypress.config.js');
	it.fails('compiles cypress.config.mjs');
	it.fails('compiles cypress.config.cjs');
});
