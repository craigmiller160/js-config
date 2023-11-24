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

const tsConfiguration =
	process.env.ESLINT_FAST === 'true'
		? 'plugin:@typescript-eslint/recommended'
		: 'plugin:@typescript-eslint/recommended-type-checked';

const tsConfigPath = controlFile.hasTestDirectory
	? path.join(process.cwd(), 'test', 'tsconfig.json')
	: path.join(process.cwd(), 'tsconfig.json');

const controlFilePlugins = controlFile.eslintPlugins.filter(
	(plugin) =>
		!(
			process.env.NO_VITEST === 'true' &&
			plugin === 'plugin:vitest/recommended'
		)
);

module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:prettier/recommended',
		'plugin:import/recommended',
		'plugin:sonarjs/recommended',
		...controlFilePlugins
	],
	parserOptions: {
		ecmaVersion: 2022,
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
			typescript: {}
		}
	},
	overrides: [
		{
			files: ['**/*.{ts,tsx,mts,cts}'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: tsConfigPath
			},
			extends: [tsConfiguration, 'plugin:import/typescript'],
			settings: {
				'import/resolver': {
					typescript: {}
				}
			}
		},
		{
			files: ['**/*.cjs'],
			env: {
				node: true
			}
		}
	]
};
