import {
	afterEach,
	beforeEach,
	describe,
	it,
	expect,
	vi,
	MockedFunction,
	test
} from 'vitest';
import path from 'path';
import fs from 'fs';
import { setupTypescript } from '../../../src/scripts/init/setupTypescript';
import { isLibraryPresent } from '../../../src/scripts/utils/library';
import { TsConfig } from '../../../src/scripts/files/TsConfig';
import { PackageJsonType } from '../../../src/scripts/files/PackageJson';
import { LibOrApp } from '../../../src/scripts/c-init';
import { match } from 'ts-pattern';

const WORKING_DIR_PATH = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'typescript'
);
const TSCONFIG = path.join(WORKING_DIR_PATH, 'tsconfig.json');
const VITE_TSCONFIG = path.join(WORKING_DIR_PATH, 'tsconfig.vite.json');
const TEST_DIR = path.join(WORKING_DIR_PATH, 'test');
const TEST_TSCONFIG = path.join(TEST_DIR, 'tsconfig.json');
const TEST_SUPPORT_TYPES_PATH = path.join(TEST_DIR, 'test-support.d.ts');
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

beforeEach(() => {
	vi.resetAllMocks();
	resetWorkingDirectory();
});

afterEach(() => {
	resetWorkingDirectory();
});

type BaseTsConfigScenario = Readonly<{
	packageJsonType: PackageJsonType;
	projectType: LibOrApp;
}>;

test.each<BaseTsConfigScenario>([
	{ packageJsonType: 'module', projectType: 'lib' },
	{ packageJsonType: 'module', projectType: 'app' },
	{ packageJsonType: 'commonjs', projectType: 'lib' }
])(
	'Setup base tsconfig.json when none exists for package.json type %packageJsonType and a $projectType project',
	({ packageJsonType, projectType }) => {
		const result = setupTypescript(
			WORKING_DIR_PATH,
			packageJsonType,
			projectType
		);
		expect(result).toBeRight();
		expect(fs.existsSync(TSCONFIG)).toBe(true);

		const extendedTsConfigName = match<BaseTsConfigScenario, string>({
			packageJsonType,
			projectType
		})
			.with(
				{ projectType: 'lib', packageJsonType: 'module' },
				() => 'tsconfig.module.lib.json'
			)
			.with(
				{ projectType: 'app', packageJsonType: 'module' },
				() => 'tsconfig.module.app.json'
			)
			.with(
				{ packageJsonType: 'commonjs' },
				() => 'tsconfig.commonjs.json'
			)
			.run();

		const expectedTsConfig: TsConfig = {
			extends: `@craigmiller160/js-config/configs/typescript/${extendedTsConfigName}`,
			include: ['src/**/*'],
			exclude: ['node_modules', 'build', 'lib']
		};
		const actualTsConfig = JSON.parse(
			fs.readFileSync(TSCONFIG, 'utf8')
		) as unknown;
		expect(actualTsConfig).toEqual<TsConfig>(expectedTsConfig);
	}
);

describe('setupTypescript', () => {
	describe('base tsconfig.json', () => {
		it('writes tsconfig.json to a library project without one, with the esmodule type, and nothing else', () => {
			const result = setupTypescript(WORKING_DIR_PATH, 'module', 'lib');
			expect(result).toBeRight();
			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(
				JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))
			).toEqual<TsConfig>({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.module.lib.json',
				include: ['src/**/*'],
				exclude: ['node_modules', 'build', 'lib']
			});

			expect(fs.existsSync(VITE_TSCONFIG)).toBe(true);
			expect(
				JSON.parse(fs.readFileSync(VITE_TSCONFIG, 'utf8'))
			).toEqual<TsConfig>({
				extends: './tsconfig.json',
				compilerOptions: {
					module: 'esnext',
					moduleResolution: 'bundler',
					verbatimModuleSyntax: true
				},
				include: ['./vite.config.ts']
			});

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(false);
			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(false);
		});

		it('writes tsconfig.json to an application project without one, with the esmodule type, and nothing else', () => {
			const result = setupTypescript(WORKING_DIR_PATH, 'module', 'app');
			expect(result).toBeRight();
			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(
				JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))
			).toEqual<TsConfig>({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.module.app.json',
				include: ['src/**/*'],
				exclude: ['node_modules', 'build', 'lib']
			});

			expect(fs.existsSync(VITE_TSCONFIG)).toBe(true);
			expect(
				JSON.parse(fs.readFileSync(VITE_TSCONFIG, 'utf8'))
			).toEqual<TsConfig>({
				extends: './tsconfig.json',
				compilerOptions: {
					module: 'esnext',
					moduleResolution: 'bundler',
					verbatimModuleSyntax: true
				},
				include: ['./vite.config.ts']
			});

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(false);
			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(false);
		});

		it('writes tsconfig.json to a project without one, with the commonjs type, and nothing else', () => {
			const result = setupTypescript(WORKING_DIR_PATH, 'commonjs', 'lib');
			expect(result).toBeRight();
			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))).toEqual({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.commonjs.json',
				include: ['src/**/*'],
				exclude: ['node_modules', 'build', 'lib']
			});

			expect(fs.existsSync(VITE_TSCONFIG)).toBe(true);
			expect(
				JSON.parse(fs.readFileSync(VITE_TSCONFIG, 'utf8'))
			).toEqual<TsConfig>({
				extends: './tsconfig.json',
				compilerOptions: {
					module: 'esnext',
					moduleResolution: 'bundler',
					verbatimModuleSyntax: true
				},
				include: ['./vite.config.mts']
			});

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(false);
			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(false);
		});

		it('writes tsconfig.json, preserving compilerOptions from existing one', () => {
			fs.writeFileSync(
				TSCONFIG,
				JSON.stringify({
					compilerOptions: {
						module: 'es2022'
					}
				})
			);

			const result = setupTypescript(WORKING_DIR_PATH, 'commonjs', 'lib');
			expect(result).toBeRight();
			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(JSON.parse(fs.readFileSync(TSCONFIG, 'utf8'))).toEqual({
				extends:
					'@craigmiller160/js-config/configs/typescript/tsconfig.commonjs.json',
				compilerOptions: {
					module: 'es2022'
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
			const result = setupTypescript(WORKING_DIR_PATH, 'commonjs', 'lib');
			expect(result).toBeRight();

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(
				fs.readFileSync(TEST_TSCONFIG, 'utf8')
			) as TsConfig;
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				include: ['../src/**/*', '**/*']
			});

			expect(fs.existsSync(TSCONFIG)).toBe(true);
			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(false);
			expect(fs.existsSync(TEST_SUPPORT_TYPES_PATH)).toBe(false);
		});

		it('writes test/tsconfig.json to project with one, preserving compilerOptions', () => {
			isLibraryPresentMock.mockReturnValue(false);
			const baseConfig = {
				compilerOptions: {
					module: 'es2022'
				}
			};
			fs.writeFileSync(TEST_TSCONFIG, JSON.stringify(baseConfig));

			const result = setupTypescript(WORKING_DIR_PATH, 'commonjs', 'lib');
			expect(result).toBeRight();

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(
				fs.readFileSync(TEST_TSCONFIG, 'utf8')
			) as TsConfig;
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				compilerOptions: {
					module: 'es2022'
				},
				include: ['../src/**/*', '**/*']
			});
			expect(fs.existsSync(TEST_SUPPORT_TYPES_PATH)).toBe(false);
		});

		it('writes test/tsconfig.json to project without one, adding support for jest-fp-ts', () => {
			isLibraryPresentMock.mockReturnValue(true);
			const result = setupTypescript(WORKING_DIR_PATH, 'commonjs', 'lib');
			expect(result).toBeRight();

			expect(fs.existsSync(TEST_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(
				fs.readFileSync(TEST_TSCONFIG, 'utf8')
			) as TsConfig;
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				include: ['../src/**/*', '**/*']
			});
			expect(isLibraryPresentMock).toHaveBeenCalledWith(
				'@relmify/jest-fp-ts'
			);
			expect(fs.existsSync(TEST_SUPPORT_TYPES_PATH)).toBe(true);
			expect(fs.readFileSync(TEST_SUPPORT_TYPES_PATH, 'utf8')).toBe(
				`import '@relmify/jest-fp-ts';\n`
			);
		});
	});

	describe('cypress tsconfig.json', () => {
		beforeEach(() => {
			fs.mkdirSync(CYPRESS_DIR);
		});

		it('writes cypress/tsconfig.json to project without one', () => {
			const result = setupTypescript(WORKING_DIR_PATH, 'commonjs', 'lib');
			expect(result).toBeRight();

			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(
				fs.readFileSync(CYPRESS_TSCONFIG, 'utf8')
			) as TsConfig;
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
					module: 'es2022',
					types: ['node', 'foo']
				}
			};
			fs.writeFileSync(CYPRESS_TSCONFIG, JSON.stringify(baseConfig));

			const result = setupTypescript(WORKING_DIR_PATH, 'commonjs', 'lib');
			expect(result).toBeRight();

			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(true);
			const tsconfig = JSON.parse(
				fs.readFileSync(CYPRESS_TSCONFIG, 'utf8')
			) as TsConfig;
			expect(tsconfig).toEqual({
				extends: '../tsconfig.json',
				compilerOptions: {
					types: ['foo', 'node', 'cypress'],
					module: 'es2022'
				},
				include: ['../src/**/*', '**/*']
			});
		});
	});
});
