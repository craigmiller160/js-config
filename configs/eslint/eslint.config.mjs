import eslintJs from '@eslint/js';
import parserTs from '@typescript-eslint/parser';
import eslintTs from '@typescript-eslint/eslint-plugin';

export default [
    eslintJs.configs.recommended,
    {
        files: [
            '**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
        ],
        languageOptions: {
            ecmaVersion: 'latest'
        }
    },
    {
        files: [
            '**/*.{ts,tsx,mts,cts}'
        ],
        languageOptions: {
            parser: parserTs,
            parserOptions: {
                project: true
            }
        }
    }
]