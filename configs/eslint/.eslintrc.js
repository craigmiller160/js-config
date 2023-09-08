module.exports = {
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	rules: {
		'no-console': [
			'error',
			{
				allow: ['error']
			}
		],
		'prettier/prettier': ['error', {}, { usePrettierrc: true }]
	},
	overrides: [
		{
			files: ['**/*.[cm]?ts?(x)'],
			parser: '@typescript-eslint/parser',
			extends: ['plugin:@typescript-eslint/recommended']
		}
	]
};
