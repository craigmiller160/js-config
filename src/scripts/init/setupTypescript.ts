import fs from 'fs';
import { function as func, either } from 'fp-ts';
import path from 'path';
import { unknownToError } from '../utils/unknownToError';
import {
	parseTsConfig,
	TsConfig,
	TsConfigCompilerOptions
} from '../files/TsConfig';
import { logger } from '../logger';

type TsConfigCreator = (existingTsConfig?: TsConfig) => TsConfig;

const createRootTsConfig =
	(hasCypress: boolean) =>
	(existingTsConfig?: TsConfig): TsConfig => {
		const cypresCompilerOptions: TsConfigCompilerOptions = {
			module: 'ES2022',
			moduleResolution: 'node'
		};
		return {
			extends:
				'@craigmiller160/js-config/configs/typescript/tsconfig.json',
			compilerOptions: existingTsConfig?.compilerOptions,
			include: ['src/**/*'],
			exclude: ['node_modules', 'build', 'lib'],
			'ts-node': hasCypress
				? {
						compilerOptions: cypresCompilerOptions
				  }
				: undefined
		};
	};

const createTestTsConfig = (existingTsConfig?: TsConfig): TsConfig => ({
	extends: '../tsconfig.json',
	compilerOptions: existingTsConfig?.compilerOptions,
	include: ['../src/**/*', '**/*']
});

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
				logger.error(`Error parsing ${tsConfigPath}: ${error}`);
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

export const setupTypescript = (cwd: string): either.Either<Error, void> => {
	logger.info('Setting up TypeScript');

	const testDirPath = path.join(cwd, 'test');
	const hasTestDir = fs.existsSync(testDirPath);
	const cypressDirPath = path.join(cwd, 'cypress');
	const hasCypressDir = fs.existsSync(cypressDirPath);

	return func.pipe(
		createTsConfig(cwd, createRootTsConfig(hasCypressDir)),
		either.chain(() => {
			if (hasTestDir) {
				return createTsConfig(testDirPath, createTestTsConfig);
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
