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

type FileAndContents = [file: string, contents: string];
const ESM_FILES: ReadonlyArray<FileAndContents> = [
	[path.join('child', 'def.css'), ''],
	[path.join('child', 'grandchild', 'one.scss'), ''],
	[
		path.join('child', 'grandchild', 'weeee.js'),
		`/* eslint-disable */ export const abc = 'def';\n`
	],
	['root.js', `/* eslint-disable */ export const hello = 'Hello World;\n`]
];

const validateEsmFiles = async () => {
	const files = await walk(esModuleDir);
	ESM_FILES.forEach(([file, contents], index) => {
		const actualFile = files[index];
		const fullExpectedFile = path.join(esModuleDir, file);
		console.log(file);
		expect(actualFile).toEqual(fullExpectedFile);
		if (path.extname(actualFile).endsWith('js')) {
			const actualFileContents = fs.readFileSync(actualFile, 'utf8');
			expect(actualFileContents).toEqual(contents);
		}
	});
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
