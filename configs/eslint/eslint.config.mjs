import eslintJs from '@eslint/js';
import parserTs from '@typescript-eslint/parser';
import eslintTs from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
    {
        files: [
            '**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
        ],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...globals.node
            }
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
        ignores: [
            'vite.config.{ts,mts,cts}'
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
            ...eslintTs.configs['eslint-recommended'].overrides[0].rules,
            ...eslintTs.configs.recommended.rules
        }
    },
    {
        files: [
            'vite.config.{ts,mts,cts}'
        ],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.vite.json'
            }
        }
    }
]