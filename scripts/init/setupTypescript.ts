import fs from 'fs';
import { readonlyArray, function as func, either } from 'fp-ts';
import path from 'path';
import {unknownToError} from '../utils/unknownToError';

type TsConfig = Readonly<{
    extends: string;
    compilerOptions?: Readonly<{}>;
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
        const rootTsConfigPath = path.join(cwd, 'tsconfig.json');
        let existingRootTsConfig: TsConfig | undefined = undefined;
        if (fs.existsSync(rootTsConfigPath)) {
            existingRootTsConfig = JSON.parse(fs.readFileSync(rootTsConfigPath, 'utf8')) as TsConfig;
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

        fs.writeFileSync(rootTsConfigPath, JSON.stringify(rootTsConfig, null, 2));
    }, unknownToError);