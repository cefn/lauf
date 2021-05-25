const path = require("path");

module.exports = () => {
  return {
    // future: {
    //   webpack5: true,
    // },
    webpack(config) {
      config.module.rules = [
        ...config.module.rules,
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
        },
      ];

      const repoModuleNames = ["lauf-runner-planview"];
      const repoModuleRoot = path.join(__dirname, "../../modules");
      const repoSrcFolder = "src";

      for (const rule of config.module.rules) {
        if (rule.test && rule.test.toString().includes("tsx|ts")) {
          rule.include = [
            ...rule.include,
            ...repoModuleNames.map(
              (moduleName) => `${repoModuleRoot}/${moduleName}/${repoSrcFolder}`
            ),
          ];
        }
      }

      return config;
    },
  };
};
