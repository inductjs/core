module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'prettier/@typescript-eslint',
		'plugin:prettier/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: { sourceType: 'module' },
	plugins: ['@typescript-eslint', 'prettier'],
	parser: '@typescript-eslint/parser',
	rules: {
		'no-cond-assign': 'off', // eslint:recommended
		'no-console': 'off', // eslint:recommended
		'no-irregular-whitespace': 'error', // eslint:recommended
		'no-unexpected-multiline': 'error', // eslint:recommended
		'curly': ['error', 'all'],
		'eqeqeq': 'warn',
		'guard-for-in': 'error',
		'no-caller': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-invalid-this': 'error',
		'no-multi-spaces': 'error',
		'no-multi-str': 'error',
		'no-new-wrappers': 'error',
		'no-throw-literal': 'error', // eslint:recommended
		'no-with': 'error',
		'prefer-promise-reject-errors': 'error',
		'no-unused-vars': ['warn', { args: 'none' }], // eslint:recommended
		'array-bracket-newline': 'off', // eslint:recommended
		'array-bracket-spacing': ['error', 'never'],
		'array-element-newline': 'off', // eslint:recommended
		'block-spacing': ['error', 'always'],
		'brace-style': ['error', 'stroustrup', { allowSingleLine: false }],
		'comma-dangle': ['error', 'always-multiline'],
		'comma-spacing': 'error',
		'comma-style': 'error',
		'computed-property-spacing': 'error',
		'eol-last': 'error',
		'func-call-spacing': 'error',
		'indent': [
			'error',
			'tab',
			{ 'SwitchCase': 1 },
			//   {
			//     CallExpression: {
			//       arguments: 2,
			//     },
			//     FunctionDeclaration: {
			//       body: 1,
			//       parameters: 2,
			//     },
			//     FunctionExpression: {
			//       body: 1,
			//       parameters: 2,
			//     },
			//     MemberExpression: 2,
			//     ObjectExpression: 1,
			//     SwitchCase: 1,
			//     ignoredNodes: ['ConditionalExpression'],
			//   },
		],
		'key-spacing': 'error',
		'keyword-spacing': 'error',
		'linebreak-style': 'off',
		'max-len': [
			'error',
			{
				code: 90,
				tabWidth: 2,
				ignoreUrls: true,
				ignoreComments: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignorePattern: 'goog.(module|require)',
			},
		],
		'new-cap': 'off',
		'no-array-constructor': 'error',
		'no-multiple-empty-lines': ['error', { max: 2 }],
		'no-nested-ternary': 'off',
		'no-new-object': 'error',
		'no-tabs': 'off',
		'no-trailing-spaces': 'error',
		'no-unneeded-ternary': 'off',
		'object-curly-newline': ['error', {
			ObjectExpression: {
				minProperties: 2,
				multiline: true,
			},
			ObjectPattern: {
				minProperties: 4,
				multiline: true,
			},
			ImportDeclaration: {
				minProperties: 3,
				multiline: true,
			},
			ExportDeclaration: {
				minProperties: 3,
				multiline: true,
			},
		}],
		'object-curly-spacing': ['error', 'always'],
		'object-property-newline': ['error'],
		'one-var': [
			'error',
			{
				var: 'never',
				let: 'never',
				const: 'never',
			},
		],
		'operator-linebreak': 'off',
		'padded-blocks': ['error', 'never'],
		'quote-props': ['error', 'consistent'],
		'quotes': ['error', 'single', { allowTemplateLiterals: true }],
		'semi': 'error',
		'semi-spacing': 'error',
		'space-before-blocks': 'error',
		'space-before-function-paren': [
			'error',
			{
				asyncArrow: 'always',
				anonymous: 'never',
				named: 'never',
			},
		],
		'space-in-parens': ['error', 'never'],
		'spaced-comment': ['error', 'always'],
		'switch-colon-spacing': 'error',
		'arrow-parens': ['error', 'as-needed'],
		'arrow-spacing': 'error',
		'constructor-super': 'error', // eslint:recommended
		'generator-star-spacing': ['error', 'after'],
		'no-const-assign': 'error', // eslint:recommended
		'no-dupe-class-members': 'error', // eslint:recommended
		'no-duplicate-imports': 'error',
		'no-new-symbol': 'error', // eslint:recommended
		'no-this-before-super': 'error', // eslint:recommended
		'no-var': 'error',
		// 'object-shorthand': 'off',
		'prefer-arrow-callback': 'error',
		'prefer-const': ['error', { destructuring: 'all' }],
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'rest-spread-spacing': 'error',
		'yield-star-spacing': ['error', 'after'],

		// Rule overrides
		'prettier/prettier': 'off',
		'@typescript-eslint/camelcase': 'off',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
	},
};
