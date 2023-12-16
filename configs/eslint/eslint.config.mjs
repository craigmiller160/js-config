import eslintJs from '@eslint/js';

export default [
    eslintJs.configs.recommended,
    {
        files: [
            '**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
        ],
        languageOptions: {
            ecmaVersion: 'latest'
        }
    }
]