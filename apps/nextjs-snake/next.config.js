module.exports = () => {
  return {
    // future: {
    //   webpack5: true,
    // },
    webpack(config) {
      config.module.rules.push({
        test: /\.tsx?$/,
        loader: "ts-loader",
      });
      return config;
    },
    future: {
      webpack5: true,
    },
    assetPrefix: "./",
  };
};
