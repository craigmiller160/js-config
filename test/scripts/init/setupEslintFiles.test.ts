import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs';
import { setupEslintFiles } from '../../../scripts/init/setupEslintFiles';

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

describe('setupEslint', () => {
	beforeEach(() => {
		wipeWorkingDir();
	});

	afterEach(() => {
		wipeWorkingDir();
	});

	it('writes default eslint & prettier config files when none exist', () => {
		const result = setupEslintFiles(WORKING_DIR);
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

	it("writes default eslint & prettier config files, replacing existing ones that don't reference this lib", () => {
		fs.writeFileSync(
			eslintrcPath,
			`module.exports = require('@craigmiller160/eslint-config-js/.eslintrc.js');`
		);
		fs.writeFileSync(
			prettierrcPath,
			`module.exports = require('@craigmiller160/prettier-config/.prettierrc.js');`
		);

		const result = setupEslintFiles(WORKING_DIR);
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

		const result = setupEslintFiles(WORKING_DIR);
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
