module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended'
    ],
    plugins: [
        '@typescript-eslint'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    env: {
        node: true,
        es6: true,
        jest: true
    },
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'prefer-const': 'error',
        'no-var': 'error',
        'no-console': 'warn'
    },
    ignorePatterns: [
        'dist/',
        'coverage/',
        'node_modules/',
        '*.js',
        'src/server.ts'
    ]
};