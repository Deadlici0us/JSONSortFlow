const js = require('@eslint/js');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const jsdoc = require('eslint-plugin-jsdoc');

module.exports = [
    js.configs.recommended,
    {
        files: ['src/**/*.ts', 'src/**/*.js'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                projectService: true,
            },
            globals: {
                // Node.js globals
                process: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                require: 'readonly',
                module: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                URL: 'readonly',
                TextEncoder: 'readonly',
                TextDecoder: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'jsdoc': jsdoc,
        },
        rules: {
            // Cyclomatic complexity max 4
            complexity: ['error', { max: 4 }],

            // Max lines per function 50
            'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],

            // Allman brace style
            'brace-style': ['error', 'allman', { allowSingleLine: false }],

            // camelCase for variables
            camelcase: ['error', { properties: 'always', allow: ['^__'] }],

            // PascalCase for functions (enforced via @typescript-eslint/naming-convention)
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'function',
                    format: ['PascalCase'],
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allowSingleOrDouble',
                    trailingUnderscore: 'allowSingleOrDouble',
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                },
            ],

            // Mandatory JSDoc for functions and classes
            'jsdoc/require-jsdoc': [
                'error',
                {
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                        ArrowFunctionExpression: false,
                        FunctionExpression: true,
                    },
                    checkGetters: true,
                    checkSetters: true,
                    checkConstructors: true,
                },
            ],

            // Additional strict rules
            'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', ignoreRestSiblings: false }],
            '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
            '@typescript-eslint/no-explicit-any': ['error'],
            'eqeqeq': ['error', 'always'],
            'no-console': ['error'],
        },
    },
    {
        files: ['tests/**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                projectService: true,
            },
            globals: {
                // Node.js globals
                process: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                require: 'readonly',
                module: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                URL: 'readonly',
                TextEncoder: 'readonly',
                TextDecoder: 'readonly',
                // Vitest globals
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                // Jest globals (for legacy tests)
                jest: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            // Relax rules for tests - tests can be verbose
            'no-console': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'max-lines-per-function': 'off',
            'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_' }],
            // Keep these for tests
            complexity: ['error', { max: 4 }],
            'brace-style': ['error', 'allman', { allowSingleLine: false }],
            camelcase: ['error', { properties: 'always', allow: ['^__'] }],
            'eqeqeq': ['error', 'always'],
        },
    },
];
