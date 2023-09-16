import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { PackageJson } from '../../../src/scripts/files/PackageJson';
import { setupVite, VITE_CONFIG } from '../../../src/scripts/init/setupVite';

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
		const config = fs.readFileSync(VITE_CONFIG_PATH, 'utf8');
		expect(config.includes('@craigmiller160/js-config')).toBe(true);
		expect(config.includes('foo')).toBe(false);
	});

	it('backs up and replaces old vite config', () => {
		fs.writeFileSync(VITE_CONFIG_PATH, 'Hello World');
		const result = setupVite(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(VITE_CONFIG_PATH)).toBe(true);
		const config = fs.readFileSync(VITE_CONFIG_PATH, 'utf8');
		expect(config.includes('@craigmiller160/js-config')).toBe(true);
		expect(config.includes('foo')).toBe(false);

		const backupConfigPath = path.join(WORKING_DIR, 'vite.config.backup');
		expect(fs.existsSync(backupConfigPath)).toBe(true);
		const backupConfig = fs.readFileSync(backupConfigPath, 'utf8');
		expect(backupConfig).toBe('Hello World');
	});

	it('does nothing when valid vite config is present', () => {
		fs.writeFileSync(VITE_CONFIG_PATH, `${VITE_CONFIG.trim()}\n// foo`);
		const result = setupVite(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(VITE_CONFIG_PATH)).toBe(true);
		const config = fs.readFileSync(VITE_CONFIG_PATH, 'utf8');
		expect(config.includes('@craigmiller160/js-config')).toBe(true);
		expect(config.includes('foo')).toBe(true);
	});
});
