import eslintJs from '@eslint/js';
import parserTs from '@typescript-eslint/parser';
import eslintTs from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import eslintPrettier from 'eslint-plugin-prettier';
import eslintSonar from 'eslint-plugin-sonarjs';
import path from 'path';
import fs from 'fs';
import url from 'url';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintVitest from 'eslint-plugin-vitest';
import eslintCypress from 'eslint-plugin-cypress';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const controlFilePath = path.join(__dirname, '..', '..', 'control-file.json');
const controlFile = JSON.parse(fs.readFileSync(controlFilePath, 'utf8'));

// TODO explore import plugin again

const eslintConfigs = [
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

if (controlFile.eslintPlugins.vitest) {
	eslintConfigs.push({
		files: ['test/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
		plugins: {
			vitest: eslintVitest
		},
		rules: {
			...eslintVitest.configs.recommended.rules
		}
	});
}

if (controlFile.eslintPlugins.cypress) {
	eslintConfigs.push({
		files: ['cypress/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
		plugins: {
			cypress: eslintCypress
		},
		rules: {
			...eslintCypress.configs.recommended.rules
		}
	});
}

if (controlFile.eslintPlugins.react) {
	eslintConfigs.push({
		files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
		plugins: {
			react: eslintReact,
			'react-hooks': eslintReactHooks,
			'jsx-a11y': eslintJsxA11y
		},
		settings: {
			react: {
				version: 'detect'
			}
		},
		rules: {
			...eslintReact.configs.recommended.rules,
			...eslintReactHooks.configs.recommended.rules,
			...eslintJsxA11y.configs.recommended.rules,
			...eslintReact.configs['jsx-runtime'].rules
		}
	});
}

export default eslintConfigs;
