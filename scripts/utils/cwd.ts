import path from 'path';
import fs from 'fs';
import {parsePackageJson} from './PackageJson';
import {either, function as func} from 'fp-ts';

export const JS_CONFIG_NAME = '@craigmiller160/js-config';

export const findCwd = (process: NodeJS.Process): string => {
    const localPackageJsonPath = path.join(process.cwd(), 'package.json');

    if (fs.existsSync(localPackageJsonPath)) {
        const name = func.pipe(
            parsePackageJson(localPackageJsonPath),
            either.fold(
                () => '',
                (packageJson) => packageJson.name
            )
        );

    }
};