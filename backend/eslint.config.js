import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    { ignores: ['node_modules/', 'public/uploads/', 'public/general/'] },
    js.configs.recommended,
    {
        files: ['src/**/*.js', 'tests/**/*.js', '*.js'],
        languageOptions: { globals: globals.node },
    },
    {
        // Migraciones en formato sequelize-cli
        files: ['**/*.cjs'],
        languageOptions: { sourceType: 'commonjs', globals: globals.node },
    },
    {
        files: ['public/js/**/*.js'],
        languageOptions: { globals: { ...globals.browser, Swal: 'readonly', bootstrap: 'readonly' } },
    },
    {
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
            eqeqeq: ['error', 'always'],
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    prettier,
];
