const path = require("path");
const { build } = require("esbuild");
const { dependencies, peerDependencies } = require("./package.json");

const external = [];
if (dependencies) {
  external.push(Object.keys(dependencies));
}
if (peerDependencies) {
  external.push(Object.keys(peerDependencies));
}

module.exports = {
  doBuild(modulePath) {
    build({
      entryPoints: [path.resolve(modulePath, "src/index.ts")],
      outdir: path.resolve(modulePath, "dist"),
      format: "cjs",
      minify: true,
      sourcemap: true,
      bundle: true,
      target: ["es6"],
      external,
    });
  },
};
