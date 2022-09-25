module.exports = {
  ...require("../../jest.config.base.cjs"),
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json",
    },
  },
};
