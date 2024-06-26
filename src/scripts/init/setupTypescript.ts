import fs from 'fs';
import { either, function as func } from 'fp-ts';
import path from 'path';
import { parseTsConfig, TsConfig } from '../files/TsConfig';
import { logger } from '../logger';
import { isLibraryPresent as isLibraryPresentDefault } from '../utils/library';
import { PackageJsonType } from '../files/PackageJson';
import { NodeOrBrowser } from '../c-init';
import { ControlFile } from '../files/ControlFile';

type IsLibraryPresent = typeof isLibraryPresentDefault;
type TsConfigCreator = (existingTsConfig?: TsConfig) => TsConfig;

const createRootTsConfig =
    (
        packageJsonType: PackageJsonType,
        nodeOrBrowser: NodeOrBrowser
    ): TsConfigCreator =>
    (existingTsConfig?: TsConfig): TsConfig => {
        const tsConfigFile =
            packageJsonType === 'module'
                ? `tsconfig.module.${nodeOrBrowser}.json`
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
    (isLibraryPresent: IsLibraryPresent) =>
    (testDirPath: string): either.Either<Error, unknown> => {
        const supportFilePath = path.join(testDirPath, 'test-support.d.ts');
        const jestFpTsImport = isLibraryPresent('@relmify/jest-fp-ts')
            ? "import '@relmify/jest-fp-ts';"
            : undefined;
        const jestDomImport = isLibraryPresent('@testing-library/jest-dom')
            ? "import '@testing-library/jest-dom';"
            : undefined;
        const fileContent = [jestFpTsImport, jestDomImport]
            .filter((item): item is string => !!item)
            .join('\n');
        const formattedFileContent = `${fileContent}\n`;

        return either.tryCatch(() => {
            if (fileContent.trim().length > 0) {
                fs.writeFileSync(supportFilePath, formattedFileContent);
            } else if (fs.existsSync(supportFilePath)) {
                fs.rmSync(supportFilePath);
            }
        }, either.toError);
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
    nodeOrBrowser: NodeOrBrowser,
    directories: ControlFile['directories'],
    isLibraryPresent: IsLibraryPresent = isLibraryPresentDefault
): either.Either<Error, void> => {
    logger.info('Setting up TypeScript');

    const testDirPath = path.join(cwd, 'test');
    const cypressDirPath = path.join(cwd, 'cypress');

    const doCreateTestSupportTypes = createTestSupportTypes(isLibraryPresent);

    return func.pipe(
        createTsConfig(cwd, createRootTsConfig(packageJsonType, nodeOrBrowser)),
        either.chain(() => createViteTsconfig(cwd, packageJsonType)),
        either.chain(() => {
            if (directories.test) {
                return func.pipe(
                    createTsConfig(path.join(cwd, 'test'), createTestTsConfig),
                    either.chain(() => doCreateTestSupportTypes(testDirPath))
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
        })
    );
};
