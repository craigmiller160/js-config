import fs from 'fs';
import { either, function as func } from 'fp-ts';
import path from 'path';
import { unknownToError } from '../utils/unknownToError';
import { parseTsConfig, TsConfig } from '../files/TsConfig';
import { logger } from '../logger';
import { isLibraryPresent } from '../utils/library';
import { PackageJsonType } from '../files/PackageJson';

type TsConfigCreator = (existingTsConfig?: TsConfig) => TsConfig;

const createRootTsConfig =
	(packageJsonType: PackageJsonType): TsConfigCreator =>
	(existingTsConfig?: TsConfig): TsConfig => {
		const tsConfigFile =
			packageJsonType === 'module'
				? 'tsconfig.module.json'
				: 'tsconfig.commonjs.json';
		return {
			extends: `@craigmiller160/js-config/configs/typescript/${tsConfigFile}`,
			compilerOptions: existingTsConfig?.compilerOptions,
			include: ['src/**/*'],
			exclude: ['node_modules', 'build', 'lib']
		};
	};

const createTestTsConfig = (existingTsConfig?: TsConfig): TsConfig => ({
	extends: '../tsconfig.json',
	compilerOptions: existingTsConfig?.compilerOptions,
	include: ['../src/**/*', '**/*']
});

const createTestSupportTypes = (
	testDirPath: string
): either.Either<Error, unknown> => {
	if (isLibraryPresent('@relmify/jest-fp-ts')) {
		const supportFilePath = path.join(testDirPath, 'test-support.d.ts');
		return either.tryCatch(
			() =>
				fs.writeFileSync(
					supportFilePath,
					`import '@relmify/jest-fp-ts';\n`
				),
			unknownToError
		);
	}
	return either.right(func.constVoid());
};

const createCypressTsConfig = (existingTsConfig?: TsConfig): TsConfig => ({
	extends: '../tsconfig.json',
	compilerOptions: {
		...(existingTsConfig?.compilerOptions ?? {}),
		types: [
			...(existingTsConfig?.compilerOptions?.types?.filter(
				(theType) => !['node', 'cypress'].includes(theType)
			) ?? []),
			'node',
			'cypress'
		]
	},
	include: ['../src/**/*', '**/*']
});

const createTsConfig = (
	dirPath: string,
	creator: TsConfigCreator
): either.Either<Error, void> => {
	const tsConfigPath = path.join(dirPath, 'tsconfig.json');
	let existingTsConfig: TsConfig | undefined = undefined;
	if (fs.existsSync(tsConfigPath)) {
		existingTsConfig = func.pipe(
			parseTsConfig(tsConfigPath),
			either.fold((error): TsConfig | undefined => {
				logger.error(`Error parsing ${tsConfigPath}: ${error.message}`);
				return undefined;
			}, func.identity)
		);
	}

	const tsConfig = creator(existingTsConfig);
	return either.tryCatch(
		() => fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2)),
		unknownToError
	);
};

const createViteTsconfig = (
	cwd: string,
	packageJsonType: PackageJsonType
): either.Either<Error, void> => {
	const viteConfigFile =
		packageJsonType === 'module' ? './vite.config.ts' : './vite.config.mts';
	const config: TsConfig = {
		extends: './tsconfig.json',
		compilerOptions: {
			module: 'ESNext',
			moduleResolution: 'bundler',
			verbatimModuleSyntax: true
		},
		include: [viteConfigFile]
	};
	const tsConfigPath = path.join(cwd, 'tsconfig.vite.json');
	return either.tryCatch(
		() => fs.writeFileSync(tsConfigPath, JSON.stringify(config, null, 2)),
		unknownToError
	);
};

export const setupTypescript = (
	cwd: string,
	packageJsonType: PackageJsonType
): either.Either<Error, void> => {
	logger.info('Setting up TypeScript');

	const testDirPath = path.join(cwd, 'test');
	const hasTestDir = fs.existsSync(testDirPath);
	const cypressDirPath = path.join(cwd, 'cypress');
	const hasCypressDir = fs.existsSync(cypressDirPath);

	return func.pipe(
		createTsConfig(cwd, createRootTsConfig(packageJsonType)),
		either.chain(() => createViteTsconfig(cwd, packageJsonType)),
		either.chain(() => {
			if (hasTestDir) {
				return func.pipe(
					createTsConfig(testDirPath, createTestTsConfig),
					either.chain(() => createTestSupportTypes(testDirPath))
				);
			}
			return either.right(func.constVoid());
		}),
		either.chain(() => {
			if (hasCypressDir) {
				return createTsConfig(cypressDirPath, createCypressTsConfig);
			}
			return either.right(func.constVoid());
		})
	);
};
