#!/usr/bin/env -S npx ts-node
/**
 * An example of running this script surgically to fix just one property...
 * npx ./validate-packages.ts
 * ...will report on all errors and warnings...
 * npx ./validate-packages.ts --filterPropertyPaths=publishConfig --strategy=dryRun
 * ...to report errors for a specific property before force-fixing, then use the fixErrors strategy
 * npx ./validate-packages.ts --filterPropertyPaths=publishConfig --strategy=fixErrors
 */
import assert from "assert";
import fs from "fs";
import glob from "glob";
import { isDeepStrictEqual } from "util";
import yargs from "yargs";
import minimatch from "minimatch";
import lodashGet from "lodash/get";
import lodashSet from "lodash/set";
import chalk from "chalk";

const RULES: ReadonlyArray<PackageJsonRule> = [
  {
    path: "homepage",
    expected: "https://github.com/cefn/lauf#readme",
    status: "error",
  },
  {
    path: "author",
    expected: "Cefn Hoile <github.com@cefn.com> (https://cefn.com)",
    status: "error",
  },
  {
    path: "repository",
    expected: "github:cefn/lauf",
    status: "error",
  },
  {
    path: "bugs",
    expected: {
      url: "https://github.com/cefn/lauf/issues",
      email: "lauf@cefn.com",
    },
    status: "error",
  },
  {
    path: "devDependencies.typescript",
    expected: "^4.2.2",
    status: "error",
  },
  {
    path: "scripts.test",
    expected: "jest",
    status: "warning",
  },
  {
    path: "scripts.check",
    expected: "tsc --noEmit",
    status: "error",
  },
  {
    path: "scripts.prepare",
    expected: "yarn run test && yarn run build",
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "license",
    expected: "MIT",
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "scripts.beta",
    expected: undefined,
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "scripts.build",
    expected: "tsc --build ./tsconfig.build.json",
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "main",
    expected: "dist/index.js",
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "files",
    expected: ["README.md", "dist"],
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "private",
    expected: true,
    packagePaths: "apps/**",
    status: "error",
  },
  {
    path: "private",
    expected: true,
    packagePaths: "modules/draft/*/package.json",
    status: "error",
  },
  {
    path: "private",
    expected: undefined,
    packagePaths: "modules/*/package.json",
    status: "error",
  },
  {
    path: "publishConfig",
    expected: {
      access: "public",
    },
    packagePaths: "modules/*/package.json",
    status: "error",
  },
] as const;

const { strategy, filterPackagePaths, filterPropertyPaths } = yargs
  .option("strategy", {
    description: "Select alignment strategy",
    type: "string",
    default: "dryRun",
    choices: ["dryRun", "fixErrors", "fixWarnings"],
  })
  .option("filterPackagePaths", {
    description: "Filter pattern for package paths",
    type: "string",
  })
  .option("filterPropertyPaths", {
    description: "Filter pattern for property names",
    type: "string",
  })
  .help()
  .alias("help", "h").argv;

const STATUSES = [
  "warning", //report violation
  "error", //fail on violation
] as const;

type Status = typeof STATUSES[number];
type Rule = typeof RULES[number];
type Expected = true | string | object | RegExp | undefined;

interface PackageJsonRule {
  /** The path to get/set within package.json (lodash) */
  path: string;
  /** The value or pattern expected at that path */
  expected: Expected;
  /** A minimatch filter limiting this rule to certain packages */
  packagePaths?: string;
  /** Whether this should count as a warning, error */
  status: Status;
}

const packageJsonPaths = glob
  .sync("**/package.json", {
    ignore: "**/node_modules/**/package.json",
  })
  .sort();

let failed = false;

for (const packageJsonPath of packageJsonPaths) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

  if (filterPackagePaths) {
    if (!minimatch(packageJsonPath, filterPackagePaths)) {
      continue;
    }
  }

  //skip workspace root
  if (packageJson.workspaces) {
    console.log(chalk.green(`Skipping workspace root ${packageJson.name}`));
    assert(packageJson.name === "lauf-monorepo");
    continue;
  }

  //traverse package json tree, checking and (optionally) fixing
  type Violation = {
    actual: any;
    expected: Expected;
    fixed: boolean;
  };
  const found: Record<Rule["path"], Violation> = {};
  let rewritePackageJson = false;
  for (const { path, expected, status, packagePaths } of RULES) {
    if (filterPropertyPaths) {
      if (!minimatch(path, filterPropertyPaths)) {
        continue;
      }
    }

    if (packagePaths) {
      if (!minimatch(packageJsonPath, packagePaths)) {
        continue;
      }
    }

    const actual = lodashGet(packageJson, path) as string;
    if (!isDeepStrictEqual(actual, expected)) {
      //record violation
      let violationColor: typeof chalk.redBright = chalk.redBright;
      if (status === "error") {
        //exit status
        failed = true;
      } else if (status === "warning") {
        violationColor = chalk.yellow;
      } else {
        throw `Unexpected status`;
      }
      const message = `${violationColor(
        status.toUpperCase()
      )} ${path} was '${chalk.red(actual)}' not '${chalk.green(
        JSON.stringify(expected)
      )}'`;
      //check strategy, possibly skip fix depending on rule status
      if (
        (status === "error" && ["dryRun"].includes(strategy)) ||
        (status === "warning" && ["dryRun", "fixWarnings"].includes(strategy))
      ) {
        //skip the fix
        found[path] = { actual, expected, fixed: false };
        continue;
      } else {
        //proceed with fix
        found[path] = { actual, expected, fixed: true };
        console.log(`${message} FIXED`);
        lodashSet(packageJson, path, expected);
        rewritePackageJson = true;
      }
    }
  }

  if (Object.entries(found).length > 0) {
    console.log(`${packageJson.name} (${chalk.gray(packageJsonPath)})`);
    for (const [path, { actual, expected, fixed }] of Object.entries(found)) {
      console.log(
        `${chalk.yellow(path)} ${chalk.red(actual)}${chalk.yellow(
          " not "
        )}${chalk.green(JSON.stringify(expected))} (${
          fixed ? "FIXED" : `NOT FIXED (${strategy})`
        })`
      );
    }
  }

  // const packageDir = dirname(packageJsonPath);
  // const tsconfigBuildPath = `${packageDir}/tsconfig.build.json`;
  // const tsconfigBuild = JSON.parse(fs.readFileSync(packageJsonPath).toString());
  //Implement this using a `skel` folder instead

  if (rewritePackageJson) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "  "));
  }
}

if (failed) {
  process.exit(-1);
}
