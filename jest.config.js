module.exports = {
  projects: [
    "<rootDir>/apps/*/jest.config.js",
    "<rootDir>/modules/*/jest.config.js",
    "<rootDir>/docs/discussion/examples/index/jest.config.js",
  ],
  coverageDirectory: "<rootDir>/coverage/",
  coverageThreshold: {
    global: {
      statements: 83.81,
      branches: 61.86,
      functions: 78.42,
      lines: 83.96,
    },
  },
};
