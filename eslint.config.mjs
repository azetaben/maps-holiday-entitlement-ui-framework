import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const nodeGlobals = {
  __dirname: 'readonly',
  Buffer: 'readonly',
  AbortSignal: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  module: 'writable',
  process: 'readonly',
  require: 'readonly',
  URL: 'readonly',
};

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      'reports/',
      'allure-results/',
      'allure-report/',
      'test-results/',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            { from: 'package', package: 'node:test', name: ['describe', 'it'] },
          ],
        },
      ],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-arrow-callback': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message: 'Use a web-first assertion instead of a fixed sleep.',
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: nodeGlobals },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { sourceType: 'module', globals: nodeGlobals },
  },
  {
    files: ['public/calculator/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        FormData: 'readonly',
      },
    },
  },
);
