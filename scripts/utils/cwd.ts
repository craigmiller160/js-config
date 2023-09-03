import path from 'path';
import fs from 'fs';
import {parsePackageJson} from './PackageJson';
import {either, function as func, option} from 'fp-ts';
import { match } from 'ts-pattern';

type CheckPathResult = 'js-config' | 'node_modules' | 'target-project' | 'invalid';

export const JS_CONFIG_NAME = '@craigmiller160/js-config';

const performPathCheck = (theDirectoryPath: string): CheckPathResult => {
    const packageJsonPath = path.join(theDirectoryPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const name = func.pipe(
            parsePackageJson(packageJsonPath),
            either.fold(
                () => '',
                (packageJson) => packageJson.name
            )
        );

        if (name === JS_CONFIG_NAME) {
            return 'js-config';
        }

        if (name !== '' && name !== JS_CONFIG_NAME) {
            return 'target-project';
        }
    }

    if (path.basename(theDirectoryPath) === 'node_modules') {
        return 'node_modules';
    }

    return 'invalid';
};

export const checkPath = (theDirectoryPath: string): either.Either<Error, string> => {
    const result = performPathCheck(theDirectoryPath);
    return match(result)
        .with('target-project', () => either.right(theDirectoryPath))
        .with('js-config', () => checkPath(path.join(theDirectoryPath, '..', '..')))
        .with('node_modules', () => checkPath(path.join(theDirectoryPath, '..')))
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