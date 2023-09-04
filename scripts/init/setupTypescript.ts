import fs from 'fs';
import { readonlyArray, function as func, either } from 'fp-ts';
import path from 'path';
import {unknownToError} from '../utils/unknownToError';
import {parseTsConfig, TsConfig} from '../utils/TsConfig';
import {logger} from '../logger';

const ADDITIONAL_FILES: ReadonlyArray<RegExp> = [
    /^vite\.config\.[cm]?ts$/,
    /^vitest\.config\.[cm]?ts$/
];

const isAdditionalFile = (file: string): boolean =>
    func.pipe(
        ADDITIONAL_FILES,
        readonlyArray.filter((regex) => regex.test(file)),
        readonlyArray.size
    ) >= 1

const findAdditionalFiles = (cwd: string): ReadonlyArray<string> =>
    func.pipe(
        fs.readdirSync(cwd),
        readonlyArray.filter(isAdditionalFile)
    );

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

    const rootTsConfigPath = path.join(cwd, 'tsconfig.json');
    let existingRootTsConfig: TsConfig | undefined = undefined;
    if (fs.existsSync(rootTsConfigPath)) {
        existingRootTsConfig = func.pipe(
            parseTsConfig(rootTsConfigPath),
            either.fold(
                (error): TsConfig | undefined => {
                    logger.error(`Error parsing root tsconfig.json: ${error}`);
                    return undefined;
                },
                func.identity
            )
        );
    }

    const rootTsConfig: TsConfig = {
        extends: '@craigmiller160/js-config/configs/typescript/tsconfig.json',
        compilerOptions: existingRootTsConfig?.compilerOptions,
        include: [
            'src/**/*',
            ...additionalFiles
        ],
        exclude: [
            'node_modules',
            'build',
            'lib'
        ]
    };

    return either.tryCatch(() => fs.writeFileSync(rootTsConfigPath, JSON.stringify(rootTsConfig, null, 2)), unknownToError);
};