import pluginJs from '@eslint/js';
import { parse as tsParser } from '@typescript-eslint/parser';
import eslintPluginImportX from 'eslint-plugin-import-x';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import { config, configs } from 'typescript-eslint';

export default config([
  pluginJs.configs.recommended,
  configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  eslintPluginPrettierRecommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  {
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: globals.browser,
      parserOptions: {
        parser: tsParser,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: true,
      },
    },
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    rules: {
      // off
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      // error
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'react/no-unescaped-entities': 'warn',
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: true },
      ],
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
        },
      ],
      // warn
      'prettier/prettier': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignoreConditionalTests: true,
          ignoreTernaryTests: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
    },
    ignores: [
      'src/constants/generated-types.ts',
      'src/constants/possible-types.ts',
      'src/routeTree.gen.ts',
    ],
  },
]);
