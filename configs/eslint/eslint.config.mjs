import eslintJs from '@eslint/js';
import parserTs from '@typescript-eslint/parser';
import eslintTs from '@typescript-eslint/eslint-plugin';

export default [
    {
        files: [
            '**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
        ],
        languageOptions: {
            ecmaVersion: 'latest'
        },
        linterOptions: {
            reportUnusedDisableDirectives: true
        },
        rules: {
            ...eslintJs.configs.recommended.rules,
            'no-console': [
                'error',
                {
                    allow: ['error']
                }
            ]
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
        },
        plugins: {
            '@typescript-eslint': eslintTs
        },
        rules: {
            ...eslintTs.configs.recommended.rules
        }
    }
]