import fs from 'fs';
import { readonlyArray, function as func, either } from 'fp-ts';
import path from 'path';
import {unknownToError} from '../utils/unknownToError';
import {parseTsConfig, TsConfig} from '../utils/TsConfig';
import {logger} from '../logger';
import {PackageJson} from '../utils/PackageJson';
import {isLibraryPresent} from '../utils/library';

const ADDITIONAL_FILES: ReadonlyArray<RegExp> = [
    /^vite\.config\.[cm]?ts$/,
    /^vitest\.config\.[cm]?ts$/
];

const isAdditionalFile = (file: string): boolean =>
    func.pipe(
        ADDITIONAL_FILES,
        readonlyArray.filter((regex) => regex.test(file)),
        readonlyArray.size
    ) >= 1;

type TsConfigCreator = (existingTsConfig?: TsConfig) => TsConfig;

const createRootTsConfig = (additionalFiles: ReadonlyArray<string>) => (existingTsConfig?: TsConfig): TsConfig => ({
    extends: '@craigmiller160/js-config/configs/typescript/tsconfig.json',
    compilerOptions: existingTsConfig?.compilerOptions,
    include: [
        'src/**/*',
        ...additionalFiles
    ],
    exclude: [
        'node_modules',
        'build',
        'lib'
    ]
});

const createTestTsConfig = (existingTsConfig?: TsConfig): TsConfig => ({
    extends: '../tsconfig.json',
    compilerOptions: existingTsConfig?.compilerOptions,
    include: [
        'src/**/*',
        '**/*'
    ]
});

const findAdditionalFiles = (cwd: string): ReadonlyArray<string> =>
    func.pipe(
        fs.readdirSync(cwd),
        readonlyArray.filter(isAdditionalFile)
    );

const createTsConfig = (dirPath: string, creator: TsConfigCreator): either.Either<Error, void> => {
    const tsConfigPath = path.join(dirPath, 'tsconfig.json');
    let existingTsConfig: TsConfig | undefined = undefined;
    if (fs.existsSync(tsConfigPath)) {
        existingTsConfig = func.pipe(
            parseTsConfig(tsConfigPath),
            either.fold(
                (error): TsConfig | undefined => {
                    logger.error(`Error parsing ${tsConfigPath}`);
                    return undefined;
                },
                func.identity
            )
        );
    }

    const tsConfig = creator(existingTsConfig);
    return either.tryCatch(() => fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2)), unknownToError);
};

export const setupTypescript = (cwd: string): either.Either<Error, void> => {
    logger.info('Setting up TypeScript');
    const additionalFiles: ReadonlyArray<string> = func.pipe(
        either.tryCatch(() => findAdditionalFiles(cwd), unknownToError),
        either.fold(
            (error) => {
                logger.error(`Error finding additional files for tsconfig: ${error}`)
                return []
            },
            func.identity
        )
    );

    const testDirPath = path.join(cwd, 'test');

    return func.pipe(
        createTsConfig(cwd, createRootTsConfig(additionalFiles)),
        either.chain(() => {
            if (fs.existsSync(testDirPath)) {
                return createTsConfig(testDirPath, createTestTsConfig);
            }
            return either.right(func.constVoid());
        })
    );
};