import { describe, it } from 'vitest';
import path from 'path';

const WORKING_DIR_PATH = path.join(process.cwd(), 'test', '__working_directories__', 'typescript');

describe('setupTypescript', () => {
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