import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import {
	ControlFile,
	getControlFilePath
} from '../../../src/scripts/files/ControlFile';
import { generateControlFile } from '../../../src/scripts/init/generateControlFile';
import { PackageJson } from '../../../src/scripts/files/PackageJson';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'generateControlFile'
);
const CONTROL_FILE = getControlFilePath(WORKING_DIR);

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
			['plugin1', 'plugin2'],
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
		expect(controlFile).toEqual({
			workingDirectoryPath: cwd,
			projectType: 'module',
			eslintPlugins: ['plugin1', 'plugin2'],
			hasTestDirectory: false,
			hasCypressDirectory: false
		});
	});
});
