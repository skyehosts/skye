import base from "@repo/eslint-config/eslint-base.config.mjs";

export default [
  ...base,
  {
    files: ["lib/lambda/**/*.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
