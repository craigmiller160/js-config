import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs';
import { setupEslintFiles } from '../../../src/scripts/init/setupEslintFiles';
import { PackageJson } from '../../../src/scripts/files/PackageJson';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'eslint'
);

const wipeWorkingDir = () =>
	fs
		.readdirSync(WORKING_DIR)
		.filter((fileName) => '.gitkeep' !== fileName)
		.map((fileName) => path.join(WORKING_DIR, fileName))
		.forEach((filePath) =>
			fs.rmSync(filePath, {
				recursive: true,
				force: true
			})
		);

const eslintConfigPath = path.join(WORKING_DIR, 'eslint.config.mjs');
const prettierrcPath = path.join(WORKING_DIR, '.prettierrc.js');

const packageJson: PackageJson = {
	name: 'name',
	version: '1.0.0',
	type: 'commonjs',
	dependencies: undefined,
	devDependencies: undefined
};

describe('setupEslint', () => {
	beforeEach(() => {
		wipeWorkingDir();
	});

	afterEach(() => {
		wipeWorkingDir();
	});

	it.fails('handle writing module & commonjs files');

	it('writes default eslint & prettier config files when none exist', () => {
		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(eslintConfigPath)).toBe(true);
		const eslintConfig = fs.readFileSync(eslintConfigPath, 'utf8');
		expect(eslintConfig.trim()).toBe(
			`export { default } from '@craigmiller160/js-config/configs/eslint/eslint.config.mjs';`
		);

		expect(fs.existsSync(prettierrcPath)).toBe(true);
		const prettierConfig = fs.readFileSync(prettierrcPath, 'utf8');
		expect(prettierConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	});

	it("writes default eslint & prettier config files, replacing existing ones that don't reference this lib", () => {
		fs.writeFileSync(
			eslintConfigPath,
			`module.exports = require('@craigmiller160/eslint-config-js/.eslintrc.js');`
		);
		fs.writeFileSync(
			prettierrcPath,
			`module.exports = require('@craigmiller160/prettier-config/.prettierrc.js');`
		);

		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(eslintConfigPath)).toBe(true);
		const eslintConfig = fs.readFileSync(eslintConfigPath, 'utf8');
		expect(eslintConfig.trim()).toBe(
			`export { default } from '@craigmiller160/js-config/configs/eslint/eslint.config.mjs';`
		);

		expect(fs.existsSync(prettierrcPath)).toBe(true);
		const prettierConfig = fs.readFileSync(prettierrcPath, 'utf8');
		expect(prettierConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	});

	it('do nothing when eslint & prettier config files that reference this lib exist', () => {
		fs.writeFileSync(
			eslintConfigPath,
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js'); \\ foo`
		);
		fs.writeFileSync(
			prettierrcPath,
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js'); \\ foo`
		);

		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(eslintConfigPath)).toBe(true);
		const eslintConfig = fs.readFileSync(eslintConfigPath, 'utf8');
		expect(eslintConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js'); \\ foo`
		);

		expect(fs.existsSync(prettierrcPath)).toBe(true);
		const prettierConfig = fs.readFileSync(prettierrcPath, 'utf8');
		expect(prettierConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js'); \\ foo`
		);
	});
});
