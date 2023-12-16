import eslintJs from '@eslint/js';
import parserTs from '@typescript-eslint/parser';
import eslintTs from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import eslintPrettier from 'eslint-plugin-prettier';
import eslintSonar from 'eslint-plugin-sonarjs';
import eslintImport from 'eslint-plugin-import';

export default [
	{
		files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
		languageOptions: {
			ecmaVersion: 'latest',
			globals: {
				...globals.node
			}
		},
		plugins: {
			prettier: eslintPrettier,
			sonarjs: eslintSonar,
			import: eslintImport
		},
		linterOptions: {
			reportUnusedDisableDirectives: true
		},
		rules: {
			...eslintJs.configs.recommended.rules,
			...eslintSonar.configs.recommended.rules,
			...eslintImport.configs.recommended.rules,
			'prettier/prettier': ['error', {}, { usePrettierrc: true }],
			'no-console': [
				'error',
				{
					allow: ['error']
				}
			],
			'sonarjs/no-duplicate-string': 0
		}
	},
	{
		files: ['**/*.{ts,tsx,mts,cts}'],
		ignores: ['vite.config.{ts,mts,cts}'],
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
			// TODO need to have type-sensitive rules too
			...eslintTs.configs.recommended.rules
		},
		settings: {
			...eslintImport.configs.typescript.settings,
			'import/resolver': {
				typescript: {}
			}
		}
	},
	{
		files: ['vite.config.{ts,mts,cts}'],
		languageOptions: {
			parserOptions: {
				project: 'tsconfig.vite.json'
			}
		}
	}
];
