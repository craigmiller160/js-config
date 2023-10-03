import { beforeEach, describe, it, expect, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { createCompile } from '../../../src/scripts/compile';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'compile'
);
const OUT_DIR = path.join(WORKING_DIR, 'out');
const TS_INPUT_FILE = path.join(WORKING_DIR, 'example-ts.ts');
const TS_OUTPUT_FILE = path.join(OUT_DIR, 'example-ts.js');
const JS_INPUT_FILE = path.join(WORKING_DIR, 'example-js.js');
const JS_OUTPUT_FILE = path.join(OUT_DIR, 'example-js.js');

const fileExists = (file: string): Promise<boolean> =>
	fs
		.stat(file)
		.then((stats) => stats.isFile())
		.catch(() => false);

const clean = (): Promise<unknown> =>
	fs
		.readdir(OUT_DIR)
		.then((files) =>
			files
				.filter((file) => '.gitkeep' !== file)
				.map((file) => fs.rm(path.join(OUT_DIR, file)))
		)
		.then((promises) => Promise.all(promises));

describe('compile file', () => {
	beforeEach(async () => {
		await clean();
	});

	afterEach(async () => {
		await clean();
	});

	it('compiles ts file with esmodules', async () => {
		const existsBefore = await fileExists(TS_OUTPUT_FILE);
		expect(existsBefore).toBe(false);
		await createCompile(WORKING_DIR, OUT_DIR, 'es6')(TS_INPUT_FILE)();

		const existsAfter = await fileExists(TS_OUTPUT_FILE);
		expect(existsAfter).toBe(true);
		const content = await fs.readFile(TS_OUTPUT_FILE, 'utf8');
		expect(content).toBe(
			`/* eslint-disable */ export const hello = 'world';\n`
		);
	});
	it.fails('compiles ts file with commonjs');
	it.fails('compiles js file with esmodules');
	it.fails('compiles js file with commonjs');
});
