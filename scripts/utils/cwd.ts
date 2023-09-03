import path from 'path';
import fs from 'fs';
import {PackageJson} from './PackageJson';

export const JS_CONFIG_NAME = '@craigmiller160/js-config';

const getPackageJsonName = (packageJsonPath: string): string => {
    const packageJson = JSON.parse(fs.readFileSync(localPackageJsonPath, 'utf8')) as PackageJson;
    return packageJson.name;
}

export const findCwd = (process: NodeJS.Process): string => {
    const localPackageJsonPath = path.join(process.cwd(), 'package.json');

    if (fs.existsSync(localPackageJsonPath) && !getPackageJsonName(localPackageJsonPath) === JS_CONFIG_NAME) {

    }
};