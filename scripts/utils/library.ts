import {PackageJson, PackageJsonDependencies, parsePackageJson} from './PackageJson';
import path from 'path';
import { either, function as func } from 'fp-ts';
import {logger} from '../logger';

const isPackageJson = (value: string | PackageJson): value is PackageJson =>
    typeof value === 'object' && Object.hasOwn(value, 'name') && Object.hasOwn(value, 'version');

const isDependencyPresent = (dependency: string | RegExp, dependencies?: PackageJsonDependencies, devDependencies?: PackageJsonDependencies): boolean =>
    Object.keys(dependencies ?? {})
        .concat(Object.keys(devDependencies ?? {}))
        .filter((key) => {
            if (typeof dependency === 'string') {
                return key === dependency;
            }
            return dependency.test(key);
        })
        .length > 0;

export const isLibraryPresent = (cwdOrPackageJson: string | PackageJson, dependency: string | RegExp): boolean => {
    logger.debug(`Checking for the presence of dependency ${dependency}`)
    let packageJson: either.Either<Error, PackageJson>;
    if (isPackageJson(cwdOrPackageJson)) {
        packageJson = either.right(cwdOrPackageJson);
    } else {
        packageJson = parsePackageJson(path.join(cwdOrPackageJson, 'package.json'))
    }

    return func.pipe(
        packageJson,
        either.map((contents) => isDependencyPresent(dependency, contents.dependencies, contents.devDependencies)),
        either.fold(
            (error) => {
                logger.error(`Error checking for the presence of dependency ${dependency} ${error}`);
                return false;
            },
            (result) => {
                logger.debug(`Dependency ${dependency} is present: ${result}`);
                return result;
            }
        )
    )
};