module.exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    "@lauf/([^/]+)": "<rootDir>../$1/src",
  },
};
