import eslintJs from '@eslint/js';
import parserTs from '@typescript-eslint/parser';
import eslintTs from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import eslintPrettier from 'eslint-plugin-prettier';
import eslintSonar from 'eslint-plugin-sonarjs';
import path from 'path';
import fs from 'fs';

const controlFilePath = path.join(__dirname, '..', '..', 'control-file.json');
const controlFile = JSON.parse(fs.readFileSync(controlFilePath, 'utf8'));
const hasReact = controlFile.eslintPlugins.includes('plugin:react/recommended');

// TODO explore import plugin again

export default (async () => {
	const defaultConfig = [
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
				sonarjs: eslintSonar
			},
			linterOptions: {
				reportUnusedDisableDirectives: true
			},
			rules: {
				...eslintJs.configs.recommended.rules,
				...eslintSonar.configs.recommended.rules,
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
				...eslintTs.configs.recommended.rules,
				'@typescript-eslint/no-misused-promises': [
					'error',
					{
						checksVoidReturn: {
							arguments: false,
							attributes: false,
							properties: true,
							returns: true,
							variables: true
						}
					}
				]
			}
		},
		{
			files: ['test/**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}']
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

	return defaultConfig;
})();
