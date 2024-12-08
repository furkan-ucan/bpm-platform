// backend/eslint.config.js
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: '.',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts']
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'import/no-unresolved': 'error',
      'import/extensions': [
        'error',
        'always',
        {
          'ts': 'never',
          'js': 'always'
        }
      ]
    }
  }
];