import path from 'path';
import fs from 'fs';
import {parsePackageJson} from './PackageJson';
import {either, function as func, option} from 'fp-ts';
import { match } from 'ts-pattern';
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

export const checkPath = (theDirectoryPath: string): either.Either<Error, string> => {
    const result = performPathCheck(theDirectoryPath);
    return match(result)
        .with('target-project', () => either.right(theDirectoryPath))
        .with('js-config', () => checkPath(path.join(theDirectoryPath, '..', '..')))
        .with('node_modules', () => checkPath(path.join(theDirectoryPath, '..')))
        .with('pnpm-child', () => checkPath(path.join(theDirectoryPath, '..')))
        .with('pnpm', () => checkPath(path.join(theDirectoryPath, '..')))
        .with('invalid', () => either.left(new Error(`Path is invalid: ${theDirectoryPath}`)))
        .exhaustive();
};

export const findCwd = (process: NodeJS.Process): either.Either<Error, string> =>
    func.pipe(
        checkPath(process.cwd()),
        either.mapLeft((error) => new Error(`Error finding matching path for starting CWD: ${process.cwd()}`, {
            cause: error
        }))
    )