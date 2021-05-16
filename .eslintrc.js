module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "jest"],
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "airbnb-typescript",
    "airbnb/hooks",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/typescript",
    "plugin:jest/recommended",
    "prettier",
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
    serviceworker: true,
  },
  ignorePatterns: ["build", ".*.js", "*.config.js", "node_modules"],
  rules: {
    //CH added speculatively to prevent https://github.com/microsoft/TypeScript/issues/18433
    "no-restricted-globals": [
      "error",
      "closed",
      "event",
      "fdescribe",
      "name",
      "length",
      "location",
      "parent",
      "top",
    ],
  },
};
