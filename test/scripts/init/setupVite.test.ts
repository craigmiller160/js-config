import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { PackageJson } from '../../../scripts/files/PackageJson';
import { setupVite } from '../../../scripts/init/setupVite';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'vite'
);
const VITE_CONFIG_PATH = path.join(WORKING_DIR, 'vite.config.ts');
const cleanWorkingDir = () =>
	fs
		.readdirSync(WORKING_DIR)
		.filter((fileName) => '.gitkeep' !== fileName)
		.forEach((fileName) =>
			fs.rmSync(path.join(WORKING_DIR, fileName), {
				recursive: true,
				force: true
			})
		);

const packageJson: PackageJson = {
	name: '',
	type: 'module',
	devDependencies: {},
	dependencies: {},
	version: ''
};

describe('setupVite', () => {
	beforeEach(() => {
		cleanWorkingDir();
	});

	afterEach(() => {
		cleanWorkingDir();
	});

	it('sets up vite config when none is there', () => {
		const result = setupVite(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(VITE_CONFIG_PATH)).toBe(true);
	});

	it.fails('backs up and replaces old vite config');

	it.fails('does nothing when valid vite config is present');
});
