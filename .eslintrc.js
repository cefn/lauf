module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  plugins: [
    "@typescript-eslint",
    "eslint-plugin-import",
    "eslint-plugin-jest",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-plugin-prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    //TODO invest the time to meet airbnb linting standards
    //"eslint-config-airbnb-typescript"
    "eslint-config-standard-typescript",
    "eslint-config-prettier",
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
    serviceworker: true,
  },
  ignorePatterns: ["build", ".*.js", "*.config.js", "node_modules"],
  rules: {},
};
