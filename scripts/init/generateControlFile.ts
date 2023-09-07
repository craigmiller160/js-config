import {ControlFile, getControlFilePath} from '../files/ControlFile';
import fs from 'fs';
import { either } from 'fp-ts';
import {unknownToError} from '../utils/unknownToError';

export const generateControlFile = (cwd: string, process: NodeJS.Process): either.Either<Error, void> => {
    const controlFile: ControlFile = {
        workingDirectoryPath: cwd
    };
    return either.tryCatch(() => fs.writeFileSync(getControlFilePath(process), JSON.stringify(controlFile, null, 2)), unknownToError);
};