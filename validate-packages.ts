#!/usr/bin/env -S pnpx ts-node
/**
 * An example of running this script surgically to fix just one property...
 * npx ./validate-packages.ts
 * ...will report on all errors and warnings...
 * npx ./validate-packages.ts --filterPropertyPaths=publishConfig --strategy=dryRun
 * ...to report errors for a specific property before force-fixing, then use the fixErrors strategy
 * npx ./validate-packages.ts --filterPropertyPaths=publishConfig --strategy=fixErrors
 */
import fs from "fs";
import glob from "glob";
import { isDeepStrictEqual } from "util";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import minimatch from "minimatch";
import { get as lodashGet, set as lodashSet } from "lodash-es";
import chalk from "chalk";

type ExpectedValueFactory = (options: {
  packageJsonPath: string;
  packageJson: { name: string };
}) => string;

const typescriptEslintConfig = {
  ignorePatterns: ["dist/**"],
  rules: {
    "no-param-reassign": [
      "error",
      {
        props: true,
        ignorePropertyModificationsFor: ["draft"],
      },
    ],
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    "no-void": [
      "error",
      {
        allowAsStatement: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "^_",
      },
    ],
    "import/prefer-default-export": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/prop-types": "off",
  },
} as const;

const reactJsEslintConfig = {
  extends: ["react-app", "react-app/jest"],
} as const;

const RULES: readonly PackageJsonRule[] = [
  {
    path: "homepage",
    expected: ({ packageJson: { name } }) => {
      const moduleName = name.replace("@lauf/", "");
      return `https://github.com/cefn/lauf/tree/main/modules/${moduleName}#readme`;
    },
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "homepage",
    expected: "https://github.com/cefn/lauf#readme",
    packagePaths: "apps/**",
    status: "error",
  },
  {
    path: "eslintConfig",
    expected: ({ packageJson: { name } }) => {
      if (name === "counter-js") {
        return reactJsEslintConfig;
      }
      return typescriptEslintConfig;
    },
    status: "warning",
  },
  {
    path: "publishConfig",
    packagePaths: "modules/**",
    expected: {
      access: "public",
      main: "dist/index.js",
      typings: "dist/index.d.ts",
    },
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
    expected: ({ packageJsonPath, packageJson: { name } }) => {
      if (packageJsonPath.includes("draft")) {
        // Allow anything - it's in draft
        return /.*/;
      }
      if (name === "counter-js") {
        return undefined;
      }
      return "^4.8.4";
    },
    status: "warning",
  },
  {
    path: "scripts.preinstall",
    expected: undefined,
    status: "error",
  },
  {
    path: "scripts.prepare",
    expected: undefined,
    status: "error",
  },
  {
    path: "scripts.test",
    expected: ({ packageJson: { name } }) => {
      if (name === "counter") {
        return "npm-run-all test:unit test:integration";
      }
      if (name === "counter-js") {
        return undefined;
      }
      if (
        [
          "@lauf/store-follow",
          "nextjs-mixer",
          "nextjs-mornington",
          "noredux-async",
        ].includes(name)
      ) {
        return "jest --passWithNoTests";
      }
      return "jest";
    },
    status: "warning",
  },
  {
    path: "scripts.check",
    expected: ({ packageJson: { name } }) => {
      if (name === "counter-js") {
        return undefined;
      }
      return "tsc --noEmit";
    },
    status: "warning",
  },
  {
    path: "scripts.prepublishOnly",
    expected: "pnpm run test && pnpm run build",
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
    expected:
      "rimraf dist && node ./esbuild.js && tsc --declaration --emitDeclarationOnly --outDir dist --project ./tsconfig.build.json",
    packagePaths: "modules/**",
    status: "error",
  },
  {
    path: "main",
    expected: "src/index.ts",
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
  // Rule temporarily disabled while lauf-runner is held back for v1.0.0
  // {
  //   path: "private",
  //   expected: undefined,
  //   packagePaths: "modules/*/package.json",
  //   status: "error",
  // },
] as const;

const STATUSES = [
  "warning", // report violation
  "error", // fail on violation
] as const;

type Status = typeof STATUSES[number];
type Rule = typeof RULES[number];
type Expected =
  | true
  | string
  // eslint-disable-next-line @typescript-eslint/ban-types
  | object
  | RegExp
  | ExpectedValueFactory
  | undefined;

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

function matchesExpectation(actualValue: unknown, expectedValue: unknown) {
  if (expectedValue instanceof RegExp && typeof actualValue === "string") {
    return actualValue.match(expectedValue);
  }
  return isDeepStrictEqual(actualValue, expectedValue);
}

async function run() {
  const { strategy, filterPackagePaths, filterPropertyPaths } = await yargs(
    hideBin(process.argv)
  )
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
    .alias("help", "h")
    .parse();

  const packageJsonPaths = glob
    .sync("**/package.json", {
      ignore: "**/node_modules/**/package.json",
    })
    .sort((a, b) => a.localeCompare(b));

  let failed = false;

  for (const packageJsonPath of packageJsonPaths) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

    if (filterPackagePaths) {
      if (!minimatch(packageJsonPath, filterPackagePaths)) {
        continue;
      }
    }

    // skip workspace root
    if (packageJson.name === "lauf-monorepo") {
      console.log(chalk.green(`Skipping workspace root ${packageJson.name}`));
      continue;
    }

    // traverse package json tree, checking and (optionally) fixing
    interface Violation {
      actualValue: any;
      expectedValue: Expected;
      fixed: boolean;
      status: Status;
    }
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

      const expectedValue =
        typeof expected === "function"
          ? expected({ packageJson, packageJsonPath })
          : expected;

      const actualValue = lodashGet(packageJson, path);
      if (!matchesExpectation(actualValue, expectedValue)) {
        // record violation
        let violationColor: typeof chalk.redBright = chalk.redBright;
        if (status === "error") {
          // exit status
          failed = true;
        } else if (status === "warning") {
          violationColor = chalk.yellow;
        } else {
          throw new Error("Unexpected status");
        }
        const message = `${violationColor(
          status.toUpperCase()
        )} ${path} was '${chalk.red(actualValue)}' not '${chalk.green(
          JSON.stringify(expectedValue)
        )}'`;
        // check strategy, possibly skip fix depending on rule status
        const fixed =
          (status === "error" && ["fixErrors"].includes(strategy)) ||
          (status === "warning" &&
            ["fixErrors", "fixWarnings"].includes(strategy));

        found[path] = { actualValue, expectedValue, status, fixed };

        if (fixed) {
          // proceed with fix
          console.log(`${message} FIXING`);
          lodashSet(packageJson, path, expectedValue);
          rewritePackageJson = true;
        }
      }
    }

    if (Object.entries(found).length > 0) {
      console.log(
        `${chalk.yellow(packageJson.name)} (${chalk.gray(packageJsonPath)})`
      );
      for (const [
        path,
        { actualValue: actual, expectedValue, fixed, status },
      ] of Object.entries(found)) {
        console.log(
          `${status.toUpperCase()} ${path} ${chalk.red(
            JSON.stringify(actual)
          )}${chalk.yellow(" SHOULD BE ")}${chalk.green(
            JSON.stringify(expectedValue)
          )} ${fixed ? "FIXED" : `NOT FIXED (strategy=${strategy})`}`
        );
      }
    }

    // const packageDir = dirname(packageJsonPath);
    // const tsconfigBuildPath = `${packageDir}/tsconfig.build.json`;
    // const tsconfigBuild = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    // Implement this using a `skel` folder instead

    if (rewritePackageJson) {
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, "  ")
      );
    }
  }

  if (failed) {
    process.exit(-1);
  }
}

run();
