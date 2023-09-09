const fs = require('fs');
const path = require('path');

const controlFilePath = path.join(__dirname, '..', '..', 'control-file.json');
const controlFile = JSON.parse(fs.readFileSync(controlFilePath, 'utf8'));
const hasReact = controlFile.eslintPlugins.includes('plugin:react/recommended');
const reactSettings = !hasReact
	? {}
	: {
			react: {
				version: 'detect'
			}
	  };

module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:prettier/recommended',
		'plugin:import/recommended',
		'plugin:sonarjs/recommended',
		...controlFile.eslintPlugins
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		}
	},
	rules: {
		'no-console': [
			'error',
			{
				allow: ['error']
			}
		],
		'prettier/prettier': ['error', {}, { usePrettierrc: true }],
		'sonarjs/no-duplicate-string': 0
	},
	settings: {
		...reactSettings,
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.cjs', '.mjs']
			}
		}
	},
	overrides: [
		{
			files: ['**/*.{ts,tsx,mts,cts}'],
			parser: '@typescript-eslint/parser',
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:import/typescript'
			],
			settings: {
				'import/parsers': {
					'@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts']
				},
				'import/resolver': {
					typescript: {}
				}
			}
		}
	]
};
