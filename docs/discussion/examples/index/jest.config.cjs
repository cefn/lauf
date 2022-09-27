module.exports = {
  ...require("../../../../jest.config.base.cjs"),
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "@lauf/([^/]+)": "<rootDir>../../../../modules/$1/src",
  },
};
