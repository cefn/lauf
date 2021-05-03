module.exports = {
  ...require("../../../../jest.config.base"),
  roots: ["<rootDir>"],
  moduleNameMapper: {
    "@lauf/([^/]+)": "<rootDir>../../../../modules/$1/src",
  },
};
