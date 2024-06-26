import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { compileAndGetCypressConfig } from '../../../src/scripts/cypress';
import { createCjsContent } from '../../testutils/compiledContent';

const WORKING_DIR = path.join(
    process.cwd(),
    'test',
    '__working_directories__',
    'compileCypress'
);
const OUTPUT_PATH = path.join(WORKING_DIR, 'node_modules', 'cypress.config.js');

const FILES_TO_KEEP = ['node_modules', '.gitignore', '.gitkeep'];

const clean = (): Promise<unknown> => {
    const rootPromise = fs
        .readdir(WORKING_DIR)
        .then((files) =>
            files
                .filter((file) => !FILES_TO_KEEP.includes(file))
                .map((file) => path.join(WORKING_DIR, file))
                .map((file) => fs.rm(file))
        )
        .then((files) => Promise.all(files));
    const nodeModulesDir = path.join(WORKING_DIR, 'node_modules');
    const nodeModulesPromise = fs
        .readdir(nodeModulesDir)
        .then((files) =>
            files
                .filter((file) => !FILES_TO_KEEP.includes(file))
                .map((file) => path.join(nodeModulesDir, file))
                .map((file) => fs.rm(file))
        )
        .then((files) => Promise.all(files));
    return Promise.all([rootPromise, nodeModulesPromise]);
};

type FileType = 'js' | 'ts';
const createCypressConfig = async (
    fileName: string,
    fileType: FileType
): Promise<void> => {
    const type = fileType === 'ts' ? ':string' : '';
    const content = `/* eslint-disable */
export const hello${type} = 'world';`;
    const filePath = path.join(WORKING_DIR, fileName);
    await fs.writeFile(filePath, content);
    await fs.stat(filePath);
};

const CJS_CONTENT = createCjsContent('hello', 'world', true);

describe('compile cypress config', () => {
    beforeEach(async () => {
        await clean();
    });

    afterEach(async () => {
        await clean();
    });

    it('compiles cypress.config.ts', async () => {
        await createCypressConfig('cypress.config.ts', 'ts');
        const result = await compileAndGetCypressConfig({
            ...process,
            cwd: () => WORKING_DIR
        })();
        expect(result).toBeRight();
        const content = await fs.readFile(OUTPUT_PATH, 'utf8');
        expect(content).toEqual(CJS_CONTENT);
    });
    it('compiles cypress.config.mts', async () => {
        await createCypressConfig('cypress.config.mts', 'ts');
        const result = await compileAndGetCypressConfig({
            ...process,
            cwd: () => WORKING_DIR
        })();
        expect(result).toBeRight();
        const content = await fs.readFile(OUTPUT_PATH, 'utf8');
        expect(content).toEqual(CJS_CONTENT);
    });
    it('compiles cypress.config.cts', async () => {
        await createCypressConfig('cypress.config.cts', 'ts');
        const result = await compileAndGetCypressConfig({
            ...process,
            cwd: () => WORKING_DIR
        })();
        expect(result).toBeRight();
        const content = await fs.readFile(OUTPUT_PATH, 'utf8');
        expect(content).toEqual(CJS_CONTENT);
    });
    it('compiles cypress.config.js', async () => {
        await createCypressConfig('cypress.config.js', 'js');
        const result = await compileAndGetCypressConfig({
            ...process,
            cwd: () => WORKING_DIR
        })();
        expect(result).toBeRight();
        const content = await fs.readFile(OUTPUT_PATH, 'utf8');
        expect(content).toEqual(CJS_CONTENT);
    });
    it('compiles cypress.config.mjs', async () => {
        await createCypressConfig('cypress.config.mjs', 'js');
        const result = await compileAndGetCypressConfig({
            ...process,
            cwd: () => WORKING_DIR
        })();
        expect(result).toBeRight();
        const content = await fs.readFile(OUTPUT_PATH, 'utf8');
        expect(content).toEqual(CJS_CONTENT);
    });
    it('compiles cypress.config.cjs', async () => {
        await createCypressConfig('cypress.config.cjs', 'js');
        const result = await compileAndGetCypressConfig({
            ...process,
            cwd: () => WORKING_DIR
        })();
        expect(result).toBeRight();
        const content = await fs.readFile(OUTPUT_PATH, 'utf8');
        expect(content).toEqual(CJS_CONTENT);
    });
});
