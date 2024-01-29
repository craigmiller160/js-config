import fs from 'fs';
import { either, function as func, readerEither } from 'fp-ts';
import path from 'path';
import { parseTsConfig, TsConfig } from '../files/TsConfig';
import { logger } from '../logger';
import { IsLibraryPresent } from '../utils/library';
import { PackageJsonType } from '../files/PackageJson';
import { LibOrApp } from '../c-init';
import { ControlFile } from '../files/ControlFile';
import {getCypressDirectoryPath, getTestDirectoryPath} from '../../utils/directories';

type TsConfigCreator = (existingTsConfig?: TsConfig) => TsConfig;

const createRootTsConfig =
	(packageJsonType: PackageJsonType, libOrApp: LibOrApp): TsConfigCreator =>
	(existingTsConfig?: TsConfig): TsConfig => {
		const tsConfigFile =
			packageJsonType === 'module'
				? `tsconfig.module.${libOrApp}.json`
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

const createTestSupportTypes =
	(
		testDirPath: string
	): readerEither.ReaderEither<IsLibraryPresent, Error, void> =>
	(isLibraryPresent) => {
		if (isLibraryPresent('@relmify/jest-fp-ts')) {
			const supportFilePath = path.join(testDirPath, 'test-support.d.ts');
			return either.tryCatch(
				() =>
					fs.writeFileSync(
						supportFilePath,
						`import '@relmify/jest-fp-ts';\n`
					),
				either.toError
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

	let existingTsConfig: either.Either<Error, TsConfig | undefined> =
		either.right(undefined);
	if (fs.existsSync(tsConfigPath)) {
		existingTsConfig = parseTsConfig(tsConfigPath);
	}

	return func.pipe(
		existingTsConfig,
		either.map(creator),
		either.chain((tsConfig) =>
			either.tryCatch(
				() =>
					fs.writeFileSync(
						tsConfigPath,
						JSON.stringify(tsConfig, null, 2)
					),
				either.toError
			)
		)
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
			module: 'esnext',
			moduleResolution: 'bundler',
			verbatimModuleSyntax: true
		},
		include: [viteConfigFile]
	};
	const tsConfigPath = path.join(cwd, 'tsconfig.vite.json');
	return either.tryCatch(
		() => fs.writeFileSync(tsConfigPath, JSON.stringify(config, null, 2)),
		either.toError
	);
};

const getCypressConfigTsconfigPath = (cwd: string): string =>
	path.join(cwd, 'tsconfig.cypress.json');

const createCypressConfigTsconfig = (
	cwd: string
): either.Either<Error, void> => {
	const config: TsConfig = {
		extends: './tsconfig.json',
		include: ['./cypress.config.ts']
	};
	const tsConfigPath = getCypressConfigTsconfigPath(cwd);
	return either.tryCatch(
		() => fs.writeFileSync(tsConfigPath, JSON.stringify(config, null, 2)),
		either.toError
	);
};

const removeCypressConfigTsconfig = (
	cwd: string
): either.Either<Error, void> => {
	const tsConfigPath = getCypressConfigTsconfigPath(cwd);
	if (fs.existsSync(tsConfigPath)) {
		return either.tryCatch(() => fs.rmSync(tsConfigPath), either.toError);
	}
	return either.right(func.constVoid());
};

export const setupTypescript = (
	cwd: string,
	packageJsonType: PackageJsonType,
	libOrApp: LibOrApp,
	directories: ControlFile['directories']
): readerEither.ReaderEither<IsLibraryPresent, Error, void> => {
	logger.info('Setting up TypeScript');

	const testDirPath = getTestDirectoryPath(cwd);
	const cypressDirPath = getCypressDirectoryPath(cwd);

	return func.pipe(
		createTsConfig(cwd, createRootTsConfig(packageJsonType, libOrApp)),
		either.chain(() => createViteTsconfig(cwd, packageJsonType)),
		either.chain(() => {
			if (directories.test) {
				return createTsConfig(
					path.join(cwd, 'test'),
					createTestTsConfig
				);
			}
			return either.right(func.constVoid());
		}),
		either.chain(() => {
			if (directories.cypress) {
				return func.pipe(
					createTsConfig(cypressDirPath, createCypressTsConfig),
					either.chain(() => createCypressConfigTsconfig(cwd))
				);
			}
			return removeCypressConfigTsconfig(cwd);
		}),
		readerEither.fromEither,
		readerEither.chain(() => {
			if (directories.test) {
				return createTestSupportTypes(testDirPath);
			}
			return readerEither.right(func.constVoid());
		})
	);
};

export type SetupTypescript = typeof setupTypescript;
