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

const eslintrcPath = path.join(WORKING_DIR, '.eslintrc.js');
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

	it('writes default eslint & prettier config files when none exist', () => {
		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(eslintrcPath)).toBe(true);
		const eslintConfig = fs.readFileSync(eslintrcPath, 'utf8');
		expect(eslintConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js');`
		);

		expect(fs.existsSync(prettierrcPath)).toBe(true);
		const prettierConfig = fs.readFileSync(prettierrcPath, 'utf8');
		expect(prettierConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	});

	it('writes default eslint & prettier config files and deletes ones with wrong extension', () => {
		const correctEslintrcPath = path.join(WORKING_DIR, '.eslintrc.cjs');
		const correctPrettierrcPath = path.join(WORKING_DIR, '.prettierrc.cjs');
		fs.writeFileSync(eslintrcPath, 'eslint');
		fs.writeFileSync(prettierrcPath, 'prettier');

		expect(fs.existsSync(eslintrcPath)).toBe(true);
		expect(fs.existsSync(prettierrcPath)).toBe(true);
		expect(fs.existsSync(correctEslintrcPath)).toBe(false);
		expect(fs.existsSync(correctPrettierrcPath)).toBe(false);

		const result = setupEslintFiles(WORKING_DIR, {
			...packageJson,
			type: 'module'
		});
		expect(result).toBeRight();

		expect(fs.existsSync(eslintrcPath)).toBe(false);
		expect(fs.existsSync(correctEslintrcPath)).toBe(true);
		const eslintConfig = fs.readFileSync(correctEslintrcPath, 'utf8');
		expect(eslintConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js');`
		);

		expect(fs.existsSync(prettierrcPath)).toBe(false);
		expect(fs.existsSync(correctPrettierrcPath)).toBe(false);
		const prettierConfig = fs.readFileSync(correctPrettierrcPath, 'utf8');
		expect(prettierConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	});

	it("writes default eslint & prettier config files, replacing existing ones that don't reference this lib", () => {
		fs.writeFileSync(
			eslintrcPath,
			`module.exports = require('@craigmiller160/eslint-config-js/.eslintrc.js');`
		);
		fs.writeFileSync(
			prettierrcPath,
			`module.exports = require('@craigmiller160/prettier-config/.prettierrc.js');`
		);

		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(eslintrcPath)).toBe(true);
		const eslintConfig = fs.readFileSync(eslintrcPath, 'utf8');
		expect(eslintConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js');`
		);

		expect(fs.existsSync(prettierrcPath)).toBe(true);
		const prettierConfig = fs.readFileSync(prettierrcPath, 'utf8');
		expect(prettierConfig.trim()).toBe(
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`
		);
	});

	it('do nothing when eslint & prettier config files that reference this lib exist', () => {
		fs.writeFileSync(
			eslintrcPath,
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.eslintrc.js'); \\ foo`
		);
		fs.writeFileSync(
			prettierrcPath,
			`module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js'); \\ foo`
		);

		const result = setupEslintFiles(WORKING_DIR, packageJson);
		expect(result).toBeRight();

		expect(fs.existsSync(eslintrcPath)).toBe(true);
		const eslintConfig = fs.readFileSync(eslintrcPath, 'utf8');
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
