import baseConfig from './eslint-base.config.mjs';
import tsEslint from 'typescript-eslint';

const tsConfig = tsEslint.configs.strict;

export default [
  ...tsConfig,
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        React: true,
        JSX: true,
      },
    },
  },
];
