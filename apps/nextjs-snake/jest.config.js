module.exports = {
  ...require("../../jest.config.base"),
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json",
    },
  },
};
