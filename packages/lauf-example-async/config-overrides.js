//APPROACH DESCRIBED AT https://medium.com/@NiGhTTraX/making-typescript-monorepos-play-nice-with-other-tools-a8d197fdc680
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = (config) => {
  config.resolve.plugins = [
    // remove plugin that throws  when importing anything outside of src/
    ...config.resolve.plugins.filter(
      (plugin) => plugin.constructor.name !== "ModuleScopePlugin"
    ),
    // add plugin that resolves path aliases
    new TsconfigPathsPlugin(),
  ];

  // Let Babel compile outside of src/.
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
  const tsRule = oneOfRule.oneOf.find(
    (rule) =>
      rule.include &&
      rule.include.endsWith("/src") &&
      rule.loader.includes("babel-loader") &&
      rule.test.toString().includes("ts|tsx")
  );
  tsRule.include = undefined;
  tsRule.exclude = /node_modules/;

  return config;
};
