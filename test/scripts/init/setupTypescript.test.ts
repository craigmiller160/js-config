import {afterEach, beforeEach, describe, it, expect} from 'vitest';
import path from 'path';
import fs from 'fs';
import {isUtf8} from 'buffer';
import {setupTypescript} from '../../../scripts/init/setupTypescript';

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
        const result = setupTypescript(WORKING_DIR_PATH);
        expect(result).toBeRight();
        const tsConfigPath = path.join(WORKING_DIR_PATH, 'tsconfig.json');
        expect(fs.existsSync(tsConfigPath)).toEqual(true);
        expect(JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'))).toEqual({
            extends: '@craigmiller160/js-config/configs/typescript/tsconfig.json',
            include: [
                'src/**/*'
            ],
            exclude: [
                'node_modules',
                'build',
                'lib'
            ]
        });
    });

    it('writes tsconfig.json to a project without one, adding additional files', () => {
        throw new Error();
    });

    it('writes tsconfig.json, preserving compilerOptions from existing one', () => {
        throw new Error();
    });
});