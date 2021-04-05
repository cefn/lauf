#!/usr/bin/env -S npx ts-node
import assert from "assert";
import fs from "fs";
import glob from "glob";
import { isDeepStrictEqual } from "util";
import yargs from "yargs";
import lodashGet from "lodash/get";
import lodashSet from "lodash/set";

const STATUSES = [
  "warning", //report violation
  "error", //fail on violation
] as const;

type Status = typeof STATUSES[number];

interface PackageJsonRule {
  /** The path to get/set within package.json (lodash) */
  path: string;
  /** The value or pattern expected at that path */
  expected: string | RegExp;
  status: Status;
}

const RULES: PackageJsonRule[] = [
  {
    path: "test",
    expected: "jest",
    status: "warning",
  },
  {
    path: "check",
    expected: "tsc --noEmit",
    status: "error",
  },
];

const { strategy } = yargs
  .option("strategy", {
    description: "Select alignment strategy",
    type: "string",
    default: "dryRun",
    choices: ["dryRun", "fixErrors", "fixWarnings"],
  })
  .help()
  .alias("help", "h").argv;

const packageJsonPaths = glob.sync("**/package.json", {
  ignore: "**/node_modules/**/package.json",
});

let failed = false;

for (const packageJsonPath of packageJsonPaths) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

  //only manipulate leaf packages (those without workspace property)
  if (packageJson.workspaces) {
    assert(packageJson.name === "lauf-monorepo");
    continue;
  }

  let fixed = false;

  for (const { path, expected, status } of RULES) {
    const actual = lodashGet(packageJson, path);
    if (!isDeepStrictEqual(actual, expected)) {
      //report violation
      console.log(`Path: ${path} should be ${expected} but found ${actual}`);
      //record for exit status
      if (status === "error") {
        failed = true;
      }
      //check strategy, possibly skip fix depending on rule status
      if (
        (status === "error" && ["dryrun"].includes(strategy)) ||
        (status === "warning" && ["dryRun", "fixWarnings"].includes(strategy))
      ) {
        console.log(`strategy = ${strategy} so not fixing`);
        continue;
      }
      //proceed to fix
      lodashSet(packageJson, path, expected);
      fixed = true;
    }
  }

  if (fixed) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "  "));
  }
}

if (failed) {
  process.exit(-1);
}
