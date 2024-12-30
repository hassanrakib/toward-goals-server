// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default tseslint.config({
  files: ['src/**/*.ts'],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    eslintConfigPrettier,
  ],
  plugins: { prettier: eslintPluginPrettier },
  rules: {
    // Enforce Prettier rules as ESLint errors
    'prettier/prettier': 'error',
    // override any rules here
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
});
