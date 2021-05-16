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

      const packageNames = ["lauf-runner-planview"];
      const packageSrc = "src";
      const packageRoot = path.join(__dirname, "../../modules");

      for (const rule of config.module.rules) {
        if (rule.test && rule.test.toString().includes("tsx|ts")) {
          rule.include = [
            ...rule.include,
            ...packageNames.map(
              (packageName) => `${packageRoot}/${packageName}/${packageSrc}`
            ),
          ];
        }
      }

      return config;
    },
  };
};
