// next.config.js
const path = require("path");
const aliasPathsToResolve = [
  {
    name: "@lauf/lauf-runner",
    path: path.resolve(__dirname, "../../modules/lauf-runner/src"),
  },
  {
    name: "@lauf/lauf-queue",
    path: path.resolve(__dirname, "../../modules/lauf-queue/src"),
  },
  {
    name: "@lauf/lauf-store",
    path: path.resolve(__dirname, "../../modules/lauf-store/src"),
  },
  {
    name: "@lauf/lauf-store-runner",
    path: path.resolve(__dirname, "../../modules/lauf-store-runner/src"),
  },
];
module.exports = () => {
  return {
    webpack(config, { defaultLoaders }) {
      config.module.rules.push({
        test: /\.tsx?$/,
        loader: "ts-loader",
      });

      /** Resolve aliases */
      aliasPathsToResolve.forEach((module) => {
        config.resolve.alias[module.name] = module.path;
      });

      config.resolve.symlinks = false;

      return config;
    },
  };
};
