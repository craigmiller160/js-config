import { describe, it, expect, beforeEach, vi } from 'vitest';
import { execute } from '../../src/scripts/c-build-lib';
import path from 'path';
import fs from 'fs';
import { walk } from '../../src/scripts/utils/files';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'buildLib'
);
const libDir = path.join(WORKING_DIR, 'lib');
const esModuleDir = path.join(libDir, 'esm');
const commonjsDir = path.join(libDir, 'cjs');
const typesDir = path.join(libDir, 'types');

vi.unmock('../../src/scripts/utils/runCommand');

const validateEsmFiles = async () => {
	const files = await walk(esModuleDir);
	throw new Error();
};
const validateCjsFiles = async () => {
	const files = await walk(commonjsDir);
	throw new Error();
};
const validateTypeFiles = async () => {
	const files = await walk(typesDir);
	throw new Error();
};

describe('c-build-lib', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		fs.rmSync(libDir, {
			recursive: true,
			force: true
		});
	});

	it('performs the entire library build for both esm and cjs', async () => {
		expect(fs.existsSync(libDir)).toBe(false);
		await execute({
			...process,
			cwd: () => WORKING_DIR
		});
		expect(fs.existsSync(esModuleDir)).toBe(true);
		expect(fs.existsSync(commonjsDir)).toBe(true);
		expect(fs.existsSync(typesDir)).toBe(true);
		await validateEsmFiles();
		await validateCjsFiles();
		await validateTypeFiles();
	});

	it.fails('performs the entire library build for just esm');

	it.fails('performs the entire library build for just cjs');
});
