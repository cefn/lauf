// next.config.js
const path = require("path");
const aliasPathsToResolve = [
  {
    name: "@lauf/lauf-runner",
    path: path.resolve(__dirname, "../packages/lauf-runner/src"),
  },
  {
    name: "@lauf/lauf-queue",
    path: path.resolve(__dirname, "../packages/lauf-queue/src"),
  },
  {
    name: "@lauf/lauf-store",
    path: path.resolve(__dirname, "../packages/lauf-store/src"),
  },
  {
    name: "@lauf/lauf-store-runner",
    path: path.resolve(__dirname, "../packages/lauf-store-runner/src"),
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
      // config.resolve.alias.react = path.resolve(
      //   __dirname,
      //   "node_modules/react"
      // );
      config.resolve.alias.react = require.resolve("react");

      config.resolve.symlinks = false;

      return config;
    },
  };
};
