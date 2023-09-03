import path from 'path';
import fs from 'fs';
import {parsePackageJson} from './PackageJson';
import {either, function as func, option} from 'fp-ts';
import { match, P } from 'ts-pattern';
import {logger} from '../logger';

type CheckPathResult = 'js-config' | 'node_modules' | 'target-project' | 'pnpm-child' | 'pnpm' | 'invalid';

const JS_CONFIG_NAME = '@craigmiller160/js-config';
const JS_CONFIG_PNPM_REGEX = /^.*@craigmiller160\+js-config$/;

const performPathCheck = (theDirectoryPath: string): CheckPathResult => {
    const packageJsonPath = path.join(theDirectoryPath, 'package.json');

    let result: CheckPathResult = 'invalid';
    if (fs.existsSync(packageJsonPath)) {
        const name = func.pipe(
            parsePackageJson(packageJsonPath),
            either.fold(
                () => '',
                (packageJson) => packageJson.name
            )
        );

        if (name === JS_CONFIG_NAME) {
            result = 'js-config';
        } else if (name !== '' && name !== JS_CONFIG_NAME) {
            result = 'target-project';
        }
    } else if (path.basename(theDirectoryPath) === 'node_modules') {
        result = 'node_modules';
    } else if (path.basename(theDirectoryPath) === '.pnpm') {
        result = 'pnpm';
    } else if (JS_CONFIG_PNPM_REGEX.test(path.basename(theDirectoryPath))) {
        result = 'pnpm-child';
    }

    logger.debug(`Performing path check. Path: ${theDirectoryPath} Result: ${result}`);
    return result;
};

class InvalidCwdPathError extends Error {
    name = 'InvalidCwdPathError';
    constructor(public pathResults: ReadonlyArray<PathAndResult>) {
        super('Unable to find valid path');
    }
}

type PathAndResult = Readonly<{
    path: string;
    result: string;
}>

export const checkPath = (theDirectoryPath: string, previousPathResults: ReadonlyArray<PathAndResult> = []): either.Either<Error, string> => {
    const result = performPathCheck(theDirectoryPath);
    const pathAndResult: PathAndResult = {
        path: theDirectoryPath,
        result
    };
    const newPathResults: ReadonlyArray<PathAndResult> = [
        ...previousPathResults,
        pathAndResult
    ];
    return match(result)
        .with('target-project', () => either.right(theDirectoryPath))
        .with('js-config', () => checkPath(path.join(theDirectoryPath, '..', '..'), newPathResults))
        .with('node_modules', () => checkPath(path.join(theDirectoryPath, '..'), newPathResults))
        .with('pnpm-child', () => checkPath(path.join(theDirectoryPath, '..'), newPathResults))
        .with('pnpm', () => checkPath(path.join(theDirectoryPath, '..'), newPathResults))
        .with('invalid', () => either.left(new InvalidCwdPathError(newPathResults)))
        .exhaustive();
};

const handleError = (error: Error): either.Either<Error, string> => {
    if (error instanceof InvalidCwdPathError && error.pathResults.length === 2) {
        return either.right('');
    }

    return either.left(new Error(`Error finding matching path for starting CWD: ${process.cwd()}`, {
        cause: error
    }));
}

export const findCwd = (process: NodeJS.Process): either.Either<Error, string> => {
    logger.info(`Attempting to find project CWD. Starting CWD: ${process.cwd()}`);
    return func.pipe(
        checkPath(process.cwd()),
        either.fold(
            handleError,
            (cwd) => {
                logger.info(`Found project CWD: ${cwd}`);
                return either.right(cwd);
            }
        )
    );
}