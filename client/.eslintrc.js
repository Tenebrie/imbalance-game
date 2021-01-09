module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/essential',
		'eslint:recommended',
		'@vue/typescript/recommended',
		'@vue/prettier',
		'@vue/prettier/@typescript-eslint',
	],
	parserOptions: {
		ecmaVersion: 2020,
	},
	globals: {
		gapi: 'readonly',
		auth2: 'readonly',
	},
	rules: {
		'no-case-declarations': 'off',
		'prettier/prettier': 'error',
		'linebreak-style': ['error', 'unix'],
		'no-tabs': 'off',
		'no-trailing-spaces': 'off',
		'object-curly-spacing': 'off',
		'space-before-function-paren': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/member-delimiter-style': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-member-accessibility': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
	},
	overrides: [
		{
			files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
			env: {
				jest: true,
			},
		},
	],
}
