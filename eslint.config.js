import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '**/dist/**',
      'node_modules/**',
      '.wrangler/**',
      'eslint.config.js',
      'api/**',
      'docs/**',
      'scripts/**',
      '**/scripts/**',
      '*.cjs',
      '**/*.cjs',
      'inspiration/**',
      'brand/**',
      '_archive/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      parser: tseslint.parser,
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests for mocking
      '@typescript-eslint/ban-ts-comment': 'off', // Allow ts-ignore in tests
    },
  }
);
