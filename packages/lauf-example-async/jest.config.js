module.exports = {
  preset: "ts-jest",
  silent: false,
  moduleNameMapper: {
    "@lauf/([^/]+)": "<rootDir>../$1/src",
  },
};
