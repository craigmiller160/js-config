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
const CONTROL_FILE = getLocalControlFile(WORKING_DIR);

const deleteControlFileIfExists = () => {
	if (fs.existsSync(CONTROL_FILE)) {
		fs.rmSync(CONTROL_FILE);
	}
};

describe('generateControlFile', () => {
	beforeEach(() => {
		deleteControlFileIfExists();
	});

	afterEach(() => {
		deleteControlFileIfExists();
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

		expect(fs.existsSync(CONTROL_FILE)).toBe(true);
		const controlFile = JSON.parse(
			fs.readFileSync(CONTROL_FILE, 'utf8')
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
