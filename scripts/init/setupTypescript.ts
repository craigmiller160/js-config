import fs from 'fs';
import { readonlyArray, function as func, either } from 'fp-ts';
import path from 'path';
import {unknownToError} from '../utils/unknownToError';

type TsConfig = Readonly<{
    extends: string;
    include: ReadonlyArray<string>;
    exclude: ReadonlyArray<string>;
}>;

const ADDITIONAL_FILES: ReadonlyArray<RegExp> = [
    /^vite\.config\.[cm]ts$/,
    /^vitest\.config\.[cm]ts$/
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

export const setupTypescript = (cwd: string): either.Either<Error, void> =>
    either.tryCatch(() => {
        const additionalFiles = findAdditionalFiles(cwd);
        const rootTsConfig: TsConfig = {
            extends: '@craigmiller160/js-config/config/typescript/tsconfig.json',
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
        const rootTsConfigPath = path.join(cwd, 'tsconfig.json');
        fs.writeFileSync(rootTsConfigPath, JSON.stringify(rootTsConfigPath, null, 2));
    }, unknownToError);