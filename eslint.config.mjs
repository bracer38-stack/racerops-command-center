import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'dist/**'] },
  { files: ['server/**/*.mjs'], ...js.configs.recommended, languageOptions: { globals: globals.node }, rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] } },
  ...ts.configs.recommended.map(config => ({ ...config, files: ['src/live/**/*.{ts,tsx}', 'vite.config.ts'] })),
  { files: ['src/live/**/*.{ts,tsx}', 'vite.config.ts'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];
