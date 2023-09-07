import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import path from 'path';
import fs from 'fs';
import {getControlFilePath} from '../../../scripts/files/ControlFile';
import {generateControlFile} from '../../../scripts/init/generateControlFile';

const WORKING_DIR = path.join(process.cwd(), 'test', '__working_directories__', 'generateControlFile');
const CONTROL_FILE = getControlFilePath(WORKING_DIR);

const deleteControlFileIfExists = () => {
    if (fs.existsSync(CONTROL_FILE)) {
        fs.rmSync(CONTROL_FILE);
    }
};

describe('generateControlFile', () => {
    beforeEach(() => {
        deleteControlFileIfExists();
    });

    afterEach(() => {
        deleteControlFileIfExists();
    });

    it('generates control file with data', () => {
        const cwd = '/hello/world';
        const result = generateControlFile(cwd, {
            ...process,
            cwd: () => WORKING_DIR
        });
        expect(result).toBeRight();

        expect(fs.existsSync(CONTROL_FILE)).toEqual(true);
        const controlFile = JSON.parse(fs.readFileSync(CONTROL_FILE, 'utf8'));
        expect(controlFile).toEqual({
            workingDirectoryPath: cwd
        });
    });
});