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

const createCjsContent = (
	varName: string,
	value: string
) => `/* eslint-disable */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "${varName}", {
    enumerable: true,
    get: function() {
        return ${varName};
    }
});
const ${varName} = '${value}';
`;

type FileAndContents = [file: string, contents: string];
const ESM_FILES: ReadonlyArray<FileAndContents> = [
	[path.join('abc.js'), `/* eslint-disable */ export const qrs = 'tuv';\n`],
	[path.join('child', 'def.css'), ''],
	[path.join('child', 'grandchild', 'one.scss'), ''],
	[
		path.join('child', 'grandchild', 'weeee.js'),
		`/* eslint-disable */ export const abc = 'def';\n`
	],
	[path.join('child', 'pics', 'abc.png'), ''],
	[
		path.join('child', 'something.js'),
		`/* eslint-disable */ export const foo = 'bar';\n`
	],
	[path.join('def.js'), `/* eslint-disable */ export const wxz = 'abc';\n`],
	[
		'other-root.js',
		`/* eslint-disable */ export const goodbye = 'universe';\n`
	],
	['root.js', `/* eslint-disable */ export const hello = 'world';\n`],
	['vite.config.js', `/* eslint-disable */ export const vite = 'vite2';\n`]
];

const CJS_FILES: ReadonlyArray<FileAndContents> = [
	[path.join('abc.js'), createCjsContent('qrs', 'tuv')],
	[path.join('child', 'def.css'), ''],
	[path.join('child', 'grandchild', 'one.scss'), ''],
	[
		path.join('child', 'grandchild', 'weeee.js'),
		createCjsContent('abc', 'def')
	],
	[path.join('child', 'pics', 'abc.png'), ''],
	[path.join('child', 'something.js'), createCjsContent('foo', 'bar')],
	[path.join('def.js'), createCjsContent('wxz', 'abc')],
	['other-root.js', createCjsContent('goodbye', 'universe')],
	['root.js', createCjsContent('hello', 'world')],
	['vite.config.js', createCjsContent('vite', 'vite2')]
];

const TYPE_FILES: ReadonlyArray<FileAndContents> = [
	[path.join('child', 'grandchild', 'weeee.d.ts'), ''],
	[path.join('child', 'something.d.ts'), ''],
	[path.join('def.d.ts'), ''],
	[path.join('global.d.ts'), ''],
	[path.join('root.d.ts'), ''],
	[path.join('vite.config.d.ts'), '']
];

const validateFiles = (
	rootDir: string,
	expectedFiles: ReadonlyArray<FileAndContents>,
	actualFiles: ReadonlyArray<string>
) => {
	expect(actualFiles).toHaveLength(expectedFiles.length);
	expectedFiles.forEach(([file, contents], index) => {
		const actualFile = actualFiles[index];
		const fullExpectedFile = path.join(rootDir, file);
		expect(actualFile).toEqual(fullExpectedFile);
		if (path.extname(actualFile).endsWith('js')) {
			const actualFileContents = fs.readFileSync(actualFile, 'utf8');
			expect(actualFileContents).toEqual(contents);
		}
	});
};

const validateEsmFiles = async () => {
	const files = await walk(esModuleDir);
	validateFiles(esModuleDir, ESM_FILES, files);
};
const validateCjsFiles = async () => {
	const files = await walk(commonjsDir);
	validateFiles(commonjsDir, CJS_FILES, files);
};
const validateTypeFiles = async () => {
	const files = await walk(typesDir);
	validateFiles(typesDir, TYPE_FILES, files);
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

	it('performs the entire library build for just esm', async () => {
		expect(fs.existsSync(libDir)).toBe(false);
		await execute({
			...process,
			argv: ['', '', '-e'],
			cwd: () => WORKING_DIR
		});
		expect(fs.existsSync(esModuleDir)).toBe(true);
		expect(fs.existsSync(commonjsDir)).toBe(false);
		expect(fs.existsSync(typesDir)).toBe(true);
		await validateEsmFiles();
		await validateTypeFiles();
	});

	it('performs the entire library build for just cjs', async () => {
		expect(fs.existsSync(libDir)).toBe(false);
		await execute({
			...process,
			argv: ['', '', '-c'],
			cwd: () => WORKING_DIR
		});
		expect(fs.existsSync(esModuleDir)).toBe(false);
		expect(fs.existsSync(commonjsDir)).toBe(true);
		expect(fs.existsSync(typesDir)).toBe(true);
		await validateCjsFiles();
		await validateTypeFiles();
	});
});
