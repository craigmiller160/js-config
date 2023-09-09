import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { getControlFilePath } from '../../../scripts/files/ControlFile';
import { generateControlFile } from '../../../scripts/init/generateControlFile';
import { PackageJson } from '../../../scripts/files/PackageJson';

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
			{
				...process,
				cwd: () => WORKING_DIR
			}
		);
		expect(result).toBeRight();

		expect(fs.existsSync(CONTROL_FILE)).toBe(true);
		const controlFile = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf8'));
		expect(controlFile).toEqual({
			workingDirectoryPath: cwd,
			projectType: 'module',
			eslintPlugins: ['plugin1', 'plugin2']
		});
	});

	it('generates control file with data and default for package.json type', () => {
		const cwd = '/hello/world';
		const packageJson: PackageJson = {
			name: '',
			version: '',
			type: undefined,
			dependencies: {},
			devDependencies: {}
		};
		const result = generateControlFile(
			cwd,
			packageJson,
			['plugin1', 'plugin2'],
			{
				...process,
				cwd: () => WORKING_DIR
			}
		);
		expect(result).toBeRight();

		expect(fs.existsSync(CONTROL_FILE)).toBe(true);
		const controlFile = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf8'));
		expect(controlFile).toEqual({
			workingDirectoryPath: cwd,
			projectType: 'commonjs',
			eslintPlugins: ['plugin1', 'plugin2']
		});
	});
});
