import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { setupTypescript } from '../../../scripts/init/setupTypescript';

const WORKING_DIR_PATH = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'typescript'
);
const ADDITIONAL_FILES = [
	'vite.config.ts',
	'vite.config.mts',
	'vite.config.cts',
	'vitest.config.ts',
	'vitest.config.mts',
	'vitest.config.cts'
];
const TSCONFIG = path.join(WORKING_DIR_PATH, 'tsconfig.json');
const TEST_DIR = path.join(WORKING_DIR_PATH, 'test');
const TEST_TSCONFIG = path.join(TEST_DIR, 'tsconfig.json');
const CYPRESS_DIR = path.join(WORKING_DIR_PATH, 'cypress');
const CYPRESS_TSCONFIG = path.join(CYPRESS_DIR, 'tsconfig.json');

const resetWorkingDirectory = () =>
	fs
		.readdirSync(WORKING_DIR_PATH)
		.filter((fileName) => !['.gitignore', '.gitkeep'].includes(fileName))
		.forEach((fileName) => {
			const fullPath = path.join(WORKING_DIR_PATH, fileName);
			fs.rmSync(fullPath, {
				recursive: true,
				force: true
			});
		});

describe('setupTypescript', () => {
	beforeEach(() => {
		resetWorkingDirectory();
	});

	afterEach(() => {
		resetWorkingDirectory();
	});

	describe('base tsconfig.json', () => {
		it('writes tsconfig.json to a project without one, and nothing else', () => {
			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();
			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))).toEqual({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.json',
				include: ['src/**/*'],
				exclude: ['node_modules', 'build', 'lib']
			});

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(false);
			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(false);
		});

		it('writes tsconfig.json to a project without one, adding additional files', () => {
			ADDITIONAL_FILES.forEach((fileName) => {
				const fullPath = path.join(WORKING_DIR_PATH, fileName);
				fs.writeFileSync(fullPath, 'a');
			});
			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();

			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))).toEqual({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.json',
				include: ['src/**/*', ...ADDITIONAL_FILES.sort()],
				exclude: ['node_modules', 'build', 'lib']
			});
		});

		it('writes tsconfig.json, preserving compilerOptions from existing one', () => {
			fs.writeFileSync(
				TSCONFIG,
				JSON.stringify({
					compilerOptions: {
						module: 'es2020'
					}
				})
			);

			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();
			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))).toEqual({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.json',
				compilerOptions: {
					module: 'es2020'
				},
				include: ['src/**/*'],
				exclude: ['node_modules', 'build', 'lib']
			});
		});
	});

	describe('test tsconfig.json', () => {
		beforeEach(() => {
			fs.mkdirSync(TEST_DIR);
		});

		it('writes test/tsconfig.json to project without one', () => {
			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(fs.readFileSync(TEST_TSCONFIG, 'utf8'));
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				include: ['../src/**/*', '**/*']
			});

			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(false);
		});

		it('writes test/tsconfig.json to project with one, preserving compilerOptions', () => {
			const baseConfig = {
				compilerOptions: {
					module: 'es2020'
				}
			};
			fs.writeFileSync(TEST_TSCONFIG, JSON.stringify(baseConfig));

			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(fs.readFileSync(TEST_TSCONFIG, 'utf8'));
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				compilerOptions: {
					module: 'es2020'
				},
				include: ['../src/**/*', '**/*']
			});
		});
	});

	describe('cypress tsconfig.json', () => {
		beforeEach(() => {
			fs.mkdirSync(CYPRESS_DIR);
		});

		it('writes cypress/tsconfig.json to project without one', () => {
			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();

			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(
				fs.readFileSync(CYPRESS_TSCONFIG, 'utf8')
			);
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				compilerOptions: {
					types: ['node', 'cypress']
				},
				include: ['../src/**/*', '**/*']
			});

			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(fs.existsSync(TEST_TSCONFIG)).toBe(false);
		});

		it('writes cypress/tsconfig.json to project with one, preserving compilerOptions', () => {
			const baseConfig = {
				compilerOptions: {
					module: 'es2020',
					types: ['node', 'foo']
				}
			};
			fs.writeFileSync(CYPRESS_TSCONFIG, JSON.stringify(baseConfig));

			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();

			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(
				fs.readFileSync(CYPRESS_TSCONFIG, 'utf8')
			);
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				compilerOptions: {
					types: ['foo', 'node', 'cypress'],
					module: 'es2020'
				},
				include: ['../src/**/*', '**/*']
			});
		});
	});
});
