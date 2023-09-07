import {ControlFile, getControlFilePath} from '../utils/ControlFile';
import fs from 'fs';
import { either } from 'fp-ts';
import {unknownToError} from '../utils/unknownToError';

export const generateControlFile = (cwd: string, theProcess: NodeJS.Process = process): either.Either<Error, void> => {
    const controlFile: ControlFile = {
        workingDirectoryPath: cwd
    };
    return either.tryCatch(() => fs.writeFileSync(getControlFilePath(theProcess), JSON.stringify(controlFile, null, 2)), unknownToError);
};