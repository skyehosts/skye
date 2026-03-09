import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  prettierRecommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    ignores: [
      ".*.?(c|m)js",
      "*.setup*.?(c|m)js",
      "*.config*.?(c|m)js",
      "*.d.ts",
      ".turbo/",
      ".git/",
      "build/",
      "dist/",
      "coverage/",
      "node_modules/",
    ],
  },
);
