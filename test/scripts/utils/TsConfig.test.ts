import { describe, it, expect } from 'vitest';
import path from 'path';
import {parseTsConfig} from '../../../scripts/utils/TsConfig';

describe('TsConfig', () => {
    it('parses tsconfig.json', () => {
        const tsConfigPath = path.join(process.cwd(), 'test', '__working_directories__', 'TsConfig', 'tsconfig.json');
        const result = parseTsConfig(tsConfigPath);
        expect(result).toEqualRight({
            extends: './configs/typescript/tsconfig.json',
            compilerOptions: {
                module: 'es2020'
            },
            include: [
                'scripts/**/*',
                'vitest.config.mts'
            ],
            exclude: [
                'node_modules',
                'build'
            ]
        })
    });
});