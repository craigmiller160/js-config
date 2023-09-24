import {
	afterEach,
	beforeEach,
	describe,
	it,
	expect,
	vi,
	MockedFunction
} from 'vitest';
import path from 'path';
import fs from 'fs';
import { setupTypescript } from '../../../src/scripts/init/setupTypescript';
import { isLibraryPresent } from '../../../src/scripts/utils/library';

const WORKING_DIR_PATH = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'typescript'
);
const TSCONFIG = path.join(WORKING_DIR_PATH, 'tsconfig.json');
const TEST_DIR = path.join(WORKING_DIR_PATH, 'test');
const TEST_TSCONFIG = path.join(TEST_DIR, 'tsconfig.json');
const CYPRESS_DIR = path.join(WORKING_DIR_PATH, 'cypress');
const CYPRESS_TSCONFIG = path.join(CYPRESS_DIR, 'tsconfig.json');

vi.mock('../../../src/scripts/utils/library', () => ({
	isLibraryPresent: vi.fn()
}));

const isLibraryPresentMock = isLibraryPresent as MockedFunction<
	typeof isLibraryPresent
>;

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
		vi.resetAllMocks();
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

		it('writes tsconfig.json, preserving compilerOptions from existing one', () => {
			fs.writeFileSync(
				TSCONFIG,
				JSON.stringify({
					compilerOptions: {
						module: 'ES2022'
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
					module: 'ES2022'
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
			isLibraryPresentMock.mockReturnValue(false);
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
			isLibraryPresentMock.mockReturnValue(false);
			const baseConfig = {
				compilerOptions: {
					module: 'ES2022'
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
					module: 'ES2022'
				},
				include: ['../src/**/*', '**/*']
			});
		});

		it('writes test/tsconfig.json to project without one, adding support for jest-fp-ts', () => {
			isLibraryPresentMock.mockReturnValue(true);
			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(fs.readFileSync(TEST_TSCONFIG, 'utf8'));
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				compilerOptions: {
					module: 'ES2022'
				},
				include: [
					'../src/**/*',
					'**/*',
					'../node_modules/@craigmiller160/js-config/lib/types/test-support/jest-fp-ts-types.d.ts'
				]
			});
			expect(isLibraryPresentMock).toHaveBeenCalledWith(
				'@relmify/jest-fp-ts'
			);
		});
	});

	describe('cypress tsconfig.json', () => {
		beforeEach(() => {
			fs.mkdirSync(CYPRESS_DIR);
		});

		it('writes the root tsconfig.json with special cypress compatibility properties', () => {
			const result = setupTypescript(WORKING_DIR_PATH);
			expect(result).toBeRight();

			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))).toEqual({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.json',
				'ts-node': {
					compilerOptions: {
						module: 'ES2022',
						moduleResolution: 'node'
					}
				},
				include: ['src/**/*'],
				exclude: ['node_modules', 'build', 'lib']
			});
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
					module: 'ES2022',
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
					module: 'ES2022'
				},
				include: ['../src/**/*', '**/*']
			});
		});
	});
});
