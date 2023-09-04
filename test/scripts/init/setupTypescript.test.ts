import {afterEach, beforeEach, describe, it} from 'vitest';
import path from 'path';
import fs from 'fs';
import {isUtf8} from 'buffer';

const WORKING_DIR_PATH = path.join(process.cwd(), 'test', '__working_directories__', 'typescript');

const resetWorkingDirectory = () => {
    fs.readdirSync(WORKING_DIR_PATH)
        .filter((fileName) => !['.gitignore', '.gitkeep'].includes(fileName))
        .forEach((fileName) => {
            const fullPath = path.join(WORKING_DIR_PATH, fileName);
            fs.rmSync(fullPath, {
                recursive: true,
                force: true
            });
        });
};

describe('setupTypescript', () => {
    beforeEach(() => {
        resetWorkingDirectory();
    });

    afterEach(() => {
        resetWorkingDirectory();
    });

    it('writes tsconfig.json to a project without one', () => {
        throw new Error();
    });

    it('writes tsconfig.json to a project without one, adding additional files', () => {
        throw new Error();
    });

    it('writes tsconfig.json, preserving compilerOptions from existing one', () => {
        throw new Error();
    });
});