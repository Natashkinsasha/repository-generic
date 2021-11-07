module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: [
        'whitesharx-typescript'
    ],
    parserOptions: {
        project: 'tsconfig.build.json',
        sourceType: 'module'
    },

    rules: {
        'max-len': ['error', 200, 2, {
            ignoreUrls: true,
            ignoreComments: false,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }],
        'lines-between-class-members': 'off',
        'object-curly-newline': 'off',
        'func-style': 'off',
        'no-useless-constructor': 'off',
        'no-undefined': 'off',
        'max-classes-per-file': 'off',
        'arrow-body-style': 'off',
        'no-magic-numbers': 'off',
        'comma-dangle': 'off',
        'no-useless-return': 'off',
        'operator-linebreak': 'off',
        'import/first': 'off',
        'line-comment-position': 'off',
        'no-shadow': 'off',
        'implicit-arrow-linebreak': 'off',
        'prefer-destructuring': 'off',
        'consistent-return': 'off',

        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/prefer-readonly': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-misused-promises': 'off',

        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-import': 'off',
        'node/no-extraneous-import': 'off',

        'import/newline-after-import': 'off',
        'import/no-unresolved': 'off',
        'import/no-cycle': 'off'
    }
}
