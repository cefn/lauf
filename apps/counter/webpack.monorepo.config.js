module.exports = require("./webpack.config");

module.exports.module.rules = module.exports.module.rules.map((rule) => {
  if (rule.use === "ts-loader") {
    rule.options = {
      ...rule.options,
      configFile: "tsconfig.monorepo.json",
    };
  }
  return rule;
});
