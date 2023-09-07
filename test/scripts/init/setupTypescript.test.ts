import {afterEach, beforeEach, describe, it, expect} from 'vitest';
import path from 'path';
import fs from 'fs';
import {isUtf8} from 'buffer';
import {setupTypescript} from '../../../scripts/init/setupTypescript';

const WORKING_DIR_PATH = path.join(process.cwd(), 'test', '__working_directories__', 'typescript');
const ADDITIONAL_FILES = [
    'vite.config.ts',
    'vite.config.mts',
    'vite.config.cts',
    'vitest.config.ts',
    'vitest.config.mts',
    'vitest.config.cts'
];

const resetWorkingDirectory = () =>
    fs.readdirSync(WORKING_DIR_PATH)
        .filter((fileName) => !['.gitignore', '.gitkeep'].includes(fileName))
        .forEach((fileName) => {
            const fullPath = path.join(WORKING_DIR_PATH, fileName);
            fs.rmSync(fullPath, {
                recursive: true,
                force: true
            });
        });

describe('setupTypescript', () => {
    beforeEach(() => {
        resetWorkingDirectory();
    });

    afterEach(() => {
        resetWorkingDirectory();
    });

    describe('base tsconfig.json', () => {
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
            ADDITIONAL_FILES.forEach((fileName) => {
                const fullPath = path.join(WORKING_DIR_PATH, fileName);
                fs.writeFileSync(fullPath, 'a');
            });
            const result = setupTypescript(WORKING_DIR_PATH);
            expect(result).toBeRight();

            const tsConfigPath = path.join(WORKING_DIR_PATH, 'tsconfig.json');
            expect(fs.existsSync(tsConfigPath)).toEqual(true);
            expect(JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'))).toEqual({
                extends: '@craigmiller160/js-config/configs/typescript/tsconfig.json',
                include: [
                    'src/**/*',
                    ...ADDITIONAL_FILES.sort()
                ],
                exclude: [
                    'node_modules',
                    'build',
                    'lib'
                ]
            });
        });

        it('writes tsconfig.json, preserving compilerOptions from existing one', () => {
            const tsConfigPath = path.join(WORKING_DIR_PATH, 'tsconfig.json');
            fs.writeFileSync(tsConfigPath, JSON.stringify({
                compilerOptions: {
                    module: 'es2020'
                }
            }));

            const result = setupTypescript(WORKING_DIR_PATH);
            expect(result).toBeRight();
            expect(fs.existsSync(tsConfigPath)).toEqual(true);
            expect(JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'))).toEqual({
                extends: '@craigmiller160/js-config/configs/typescript/tsconfig.json',
                compilerOptions: {
                    module: 'es2020'
                },
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
    });

    describe('test tsconfig.json', () => {
        it('writes test/tsconfig.json to project without one', () => {
            throw new Error();
        });

        it('writes test/tsconfig.json to project with one, preserving compilerOptions', () => {
            throw new Error();
        });
    })
});