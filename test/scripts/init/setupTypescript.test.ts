import {
	afterEach,
	beforeEach,
	expect,
	MockedFunction,
	test,
	vi
} from 'vitest';
import path from 'path';
import fs from 'fs';
import { setupTypescript } from '../../../src/scripts/init/setupTypescript';
import {
	TsConfig,
	TsConfigCompilerOptions
} from '../../../src/scripts/files/TsConfig';
import { PackageJsonType } from '../../../src/scripts/files/PackageJson';
import { NodeOrBrowser } from '../../../src/scripts/c-init';
import { match } from 'ts-pattern';
import { isLibraryPresent } from '../../../src/scripts/utils/library';

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
const CYPRESS_CONFIG_TSCONFIG = path.join(
	WORKING_DIR_PATH,
	'tsconfig.cypress.json'
);

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

type PriorTsConfig = 'exist' | 'not exist';

type BaseTsConfigScenario = Readonly<{
	packageJsonType: PackageJsonType;
	projectType: NodeOrBrowser;
	priorTsConfig: PriorTsConfig;
}>;

const createDirectoriesForFile = (tsconfigPath: string): undefined => {
	fs.mkdirSync(path.dirname(tsconfigPath), {
		recursive: true
	});
	return undefined;
};

const writeExistingTsConfig = (
	tsconfigPath: string
): TsConfigCompilerOptions => {
	const compilerOptions: TsConfigCompilerOptions = {
		module: 'es2022'
	};
	const tsConfig: TsConfig = {
		extends:
			'@craigmiller160/js-config/configs/typescript/tsconfig.wrong.json',
		compilerOptions
	};

	createDirectoriesForFile(tsconfigPath);
	fs.writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));
	return compilerOptions;
};

test.each<BaseTsConfigScenario>([
	{
		packageJsonType: 'module',
		projectType: 'node',
		priorTsConfig: 'not exist'
	},
	{
		packageJsonType: 'module',
		projectType: 'node',
		priorTsConfig: 'exist'
	},
	{
		packageJsonType: 'module',
		projectType: 'browser',
		priorTsConfig: 'not exist'
	},
	{
		packageJsonType: 'module',
		projectType: 'browser',
		priorTsConfig: 'exist'
	},
	{
		packageJsonType: 'commonjs',
		projectType: 'node',
		priorTsConfig: 'not exist'
	},
	{
		packageJsonType: 'commonjs',
		projectType: 'node',
		priorTsConfig: 'exist'
	}
])(
	'Setup base tsconfig.json for package.json type $packageJsonType, a $projectType project, where the prior tsconfig does $priorTsConfig',
	({ packageJsonType, projectType, priorTsConfig }) => {
		const compilerOptions: TsConfigCompilerOptions | undefined = match(
			priorTsConfig
		)
			.with('exist', () => writeExistingTsConfig(TSCONFIG))
			.with('not exist', () => undefined)
			.exhaustive();
		const result = setupTypescript(
			WORKING_DIR_PATH,
			packageJsonType,
			projectType,
			{
				test: false,
				cypress: false
			}
		);
		expect(result).toBeRight();
		expect(fs.existsSync(TSCONFIG)).toBe(true);

		const extendedTsConfigName = match<
			Omit<BaseTsConfigScenario, 'priorTsConfig'>,
			string
		>({
			packageJsonType,
			projectType
		})
			.with(
				{ projectType: 'node', packageJsonType: 'module' },
				() => 'tsconfig.module.node.json'
			)
			.with(
				{ projectType: 'browser', packageJsonType: 'module' },
				() => 'tsconfig.module.browser.json'
			)
			.with(
				{ packageJsonType: 'commonjs' },
				() => 'tsconfig.commonjs.json'
			)
			.run();

		const expectedTsConfig: TsConfig = {
			extends: `@craigmiller160/js-config/configs/typescript/${extendedTsConfigName}`,
			include: ['src/**/*'],
			exclude: ['node_modules', 'build', 'lib'],
			compilerOptions
		};
		const actualTsConfig = JSON.parse(
			fs.readFileSync(TSCONFIG, 'utf8')
		) as unknown;
		expect(actualTsConfig).toEqual<TsConfig>(expectedTsConfig);

		expect(fs.existsSync(VITE_TSCONFIG)).toBe(true);

		const viteConfigExtension = match(packageJsonType)
			.with('module', () => 'ts')
			.with('commonjs', () => 'mts')
			.exhaustive();

		const expectedViteTsConfig: TsConfig = {
			extends: './tsconfig.json',
			compilerOptions: {
				module: 'esnext',
				moduleResolution: 'bundler',
				verbatimModuleSyntax: true
			},
			include: [`./vite.config.${viteConfigExtension}`]
		};
		const actualViteTsConfig = JSON.parse(
			fs.readFileSync(VITE_TSCONFIG, 'utf8')
		) as unknown;
		expect(actualViteTsConfig).toEqual<TsConfig>(expectedViteTsConfig);
	}
);

type Directory = 'present' | 'not present';

type AltTsconfigScenario = Readonly<{
	directory: Directory;
	priorTsConfig?: PriorTsConfig;
}>;

test.each<AltTsconfigScenario>([
	{ directory: 'present', priorTsConfig: 'exist' },
	{ directory: 'present', priorTsConfig: 'not exist' },
	{ directory: 'not present' }
])(
	'Writes test tsconfig when directory is $directory and prior tsconfig $priorTsConfig',
	({ directory, priorTsConfig }) => {
		const compilerOptions: TsConfigCompilerOptions | undefined = match(
			priorTsConfig
		)
			.with('exist', () => writeExistingTsConfig(TEST_TSCONFIG))
			.with('not exist', () => createDirectoriesForFile(TEST_TSCONFIG))
			.with(undefined, () => undefined)
			.exhaustive();

		const result = setupTypescript(WORKING_DIR_PATH, 'module', 'node', {
			test: directory === 'present',
			cypress: false
		});
		expect(result).toBeRight();
		if (directory === 'not present') {
			expect(fs.existsSync(TEST_TSCONFIG)).toBe(false);
			return;
		}

		const expectedTsConfig: TsConfig = {
			extends: '../tsconfig.json',
			compilerOptions,
			include: ['../src/**/*', '**/*']
		};
		const actualTsConfig = JSON.parse(
			fs.readFileSync(TEST_TSCONFIG, 'utf8')
		) as unknown;
		expect(actualTsConfig).toEqual(expectedTsConfig);
	}
);

type SupportTypesScenario = Readonly<{
	jestFpTs: boolean;
	jestDom: boolean;
}>;

test.each<SupportTypesScenario>([
	{ jestDom: false, jestFpTs: false },
	{ jestDom: true, jestFpTs: false },
	{ jestDom: true, jestFpTs: false },
	{ jestDom: true, jestFpTs: true }
])(
	'creates support types, with jest-dom $jestDom and jest-fp-ts $jestFpTs',
	({ jestDom, jestFpTs }) => {
		createDirectoriesForFile(TEST_SUPPORT_TYPES_PATH);
		const isLibraryPresentMock: MockedFunction<typeof isLibraryPresent> =
			vi.fn();
		isLibraryPresentMock.mockImplementation(
			(lib) =>
				(lib === '@relmify/jest-fp-ts' && jestFpTs) ||
				(lib === '@testing-library/jest-dom' && jestDom)
		);

		if (!jestFpTs && !jestDom) {
			fs.writeFileSync(TEST_SUPPORT_TYPES_PATH, '');
		}

		const result = setupTypescript(
			WORKING_DIR_PATH,
			'module',
			'node',
			{
				test: true,
				cypress: false
			},
			isLibraryPresentMock
		);
		expect(result).toBeRight();

		if (!jestFpTs && !jestDom) {
			expect(fs.existsSync(TEST_SUPPORT_TYPES_PATH)).toBe(false);
			return;
		}

		expect(fs.existsSync(TEST_SUPPORT_TYPES_PATH)).toBe(true);
		const content = fs.readFileSync(TEST_SUPPORT_TYPES_PATH, 'utf8');
		if (jestFpTs) {
			expect(content).toMatch(/import '@relmify\/jest-fp-ts';/);
		}
		if (jestDom) {
			expect(content).toMatch(/import '@testing-library\/jest-dom';/);
		}
	}
);

test.each<AltTsconfigScenario>([
	{ directory: 'present', priorTsConfig: 'exist' },
	{ directory: 'present', priorTsConfig: 'not exist' },
	{ directory: 'not present' }
])(
	'Writes cypress tsconfig when directory is $directory and prior tsconfig $priorTsConfig',
	({ directory, priorTsConfig }) => {
		const compilerOptions: TsConfigCompilerOptions | undefined = match(
			priorTsConfig
		)
			.with('exist', () => writeExistingTsConfig(CYPRESS_TSCONFIG))
			.with('not exist', () => createDirectoriesForFile(CYPRESS_TSCONFIG))
			.with(undefined, () => undefined)
			.exhaustive();

		const result = setupTypescript(WORKING_DIR_PATH, 'module', 'node', {
			test: false,
			cypress: directory === 'present'
		});
		expect(result).toBeRight();
		if (directory === 'not present') {
			expect(fs.existsSync(CYPRESS_TSCONFIG)).toBe(false);
			expect(fs.existsSync(CYPRESS_CONFIG_TSCONFIG)).toBe(false);
			return;
		}

		const expectedCypressTsconfig: TsConfig = {
			extends: '../tsconfig.json',
			compilerOptions: {
				...(compilerOptions ?? {}),
				types: ['node', 'cypress']
			},
			include: ['../src/**/*', '**/*']
		};
		const actualCypressTsconfig = JSON.parse(
			fs.readFileSync(CYPRESS_TSCONFIG, 'utf8')
		) as unknown;
		expect(actualCypressTsconfig).toEqual(expectedCypressTsconfig);

		const expectedCypressConfigTsconfig: TsConfig = {
			extends: './tsconfig.json',
			include: ['./cypress.config.ts']
		};
		const actualCypressConfigTsconfig = JSON.parse(
			fs.readFileSync(CYPRESS_CONFIG_TSCONFIG, 'utf8')
		) as unknown;
		expect(actualCypressConfigTsconfig).toEqual(
			expectedCypressConfigTsconfig
		);
	}
);

test('removes tsconfig.cypress.json when no cypress directory', () => {
	writeExistingTsConfig(CYPRESS_CONFIG_TSCONFIG);
	expect(fs.existsSync(CYPRESS_CONFIG_TSCONFIG)).toBe(true);
	const result = setupTypescript(WORKING_DIR_PATH, 'module', 'node', {
		test: false,
		cypress: false
	});
	expect(result).toBeRight();

	expect(fs.existsSync(CYPRESS_CONFIG_TSCONFIG)).toBe(false);
});
