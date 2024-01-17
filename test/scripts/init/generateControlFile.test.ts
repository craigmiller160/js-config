import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs';
import {
	ControlFile,
	getLocalControlFile
} from '../../../src/scripts/files/ControlFile';
import { generateControlFile } from '../../../src/scripts/init/generateControlFile';
import { PackageJson } from '../../../src/scripts/files/PackageJson';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'generateControlFile'
);
const JS_CONFIG_WORKING_DIR = path.join(
	WORKING_DIR,
	'node_modules',
	'@craigmiller160',
	'js-config'
);
const ROOT_CONTROL_FILE = getLocalControlFile(WORKING_DIR);
const JS_CONFIG_CONTROL_FILE = getLocalControlFile(JS_CONFIG_WORKING_DIR);
const ROOT_PACKAGE_JSON = path.join(WORKING_DIR, 'package.json');
const JS_CONFIG_PACKAGE_JSON = path.join(JS_CONFIG_WORKING_DIR, 'package.json');

const cleanup = () => {
	[
		JS_CONFIG_CONTROL_FILE,
		ROOT_CONTROL_FILE,
		ROOT_PACKAGE_JSON,
		JS_CONFIG_PACKAGE_JSON
	].forEach((file) => {
		if (fs.existsSync(file)) {
			fs.rmSync(file);
		}
	});
};

describe('generateControlFile', () => {
	beforeEach(() => {
		cleanup();
	});

	afterEach(() => {
		cleanup();
	});

	it('generates control file with data for node_modules path', () => {
		throw new Error();
	});

	it('generates control file with data', () => {
		const cwd = '/hello/world';
		const packageJson: PackageJson = {
			name: '',
			version: '',
			type: 'module',
			dependencies: {},
			devDependencies: {}
		};
		const result = generateControlFile(
			cwd,
			packageJson,
			{
				react: true,
				cypress: false,
				vitest: true,
				jestDom: false,
				tanstackQuery: true,
				testingLibraryReact: false
			},
			false,
			false,
			{
				...process,
				cwd: () => WORKING_DIR
			}
		);
		expect(result).toBeRight();

		expect(fs.existsSync(ROOT_CONTROL_FILE)).toBe(true);
		const controlFile = JSON.parse(
			fs.readFileSync(ROOT_CONTROL_FILE, 'utf8')
		) as ControlFile;
		expect(controlFile).toEqual<ControlFile>({
			workingDirectoryPath: cwd,
			projectType: 'module',
			eslintPlugins: {
				react: true,
				cypress: false,
				vitest: true,
				jestDom: false,
				tanstackQuery: true,
				testingLibraryReact: false
			},
			directories: {
				test: false,
				cypress: false
			}
		});
	});
});
