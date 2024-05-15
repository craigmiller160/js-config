import {
    ControlFile,
    EslintPlugins,
    getControlFilePath
} from '../files/ControlFile';
import fs from 'fs';
import { either } from 'fp-ts';
import { PackageJson } from '../files/PackageJson';
import { logger } from '../logger';

export const generateControlFile = (
    cwd: string,
    packageJson: PackageJson,
    eslintPlugins: EslintPlugins,
    hasTestDirectory: boolean,
    hasCypressDirectory: boolean,
    process: NodeJS.Process
): either.Either<Error, void> => {
    logger.info('Generating control file');
    const controlFile: ControlFile = {
        workingDirectoryPath: cwd,
        projectType: packageJson.type,
        eslintPlugins,
        directories: {
            test: hasTestDirectory,
            cypress: hasCypressDirectory
        }
    };

    const controlFileJson = JSON.stringify(controlFile, null, 2);
    const controlFilePath = getControlFilePath(process.cwd());
    return either.tryCatch(
        () => fs.writeFileSync(controlFilePath, controlFileJson),
        either.toError
    );
};
