module.exports = () => {
  return {
    webpack(config) {
      config.module.rules.push({
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: { compilerOptions: { noEmit: false } },
      });
      return config;
    },
  };
};
