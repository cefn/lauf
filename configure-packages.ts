#!/usr/bin/env -S npx ts-node
import fs from "fs";
import glob from "glob";
import { isDeepStrictEqual } from "util";
import yargs from "yargs";

const options = yargs
  .option("fix", {
    alias: "f",
    description: "Fix package.json files",
    type: "boolean",
  })
  .option("missing", {
    alias: "m",
    description: "Only add if missing, never replace",
    type: "boolean",
  })
  .help()
  .alias("help", "h").argv;

type PackageEntry = Record<string, any>;

//Retrieve workspace package.json paths.
//Excludes node_modules' package.json
const packageJsonPaths = glob.sync("**/package.json", {
  ignore: "**/node_modules/**/package.json",
});

function findIncorrectValues(
  packageNode: PackageEntry,
  correctValues: PackageEntry,
  { fix, missing }: typeof options
) {
  const incorrectValues: PackageEntry = {};
  for (const [name, correctValue] of Object.entries(correctValues)) {
    const actualValue = packageNode[name];
    if (!isDeepStrictEqual(actualValue, correctValue)) {
      incorrectValues[name] = actualValue;
      if (fix) {
        if (missing && actualValue !== undefined) {
          continue; //skip values which are already there in some form
        }
        packageNode[name] = correctValue;
      }
    }
  }
  return incorrectValues;
}

const correctScriptValues = {
  test: "jest",
  check: "tsc --noEmit",
} as const;

for (const packageJsonPath of packageJsonPaths) {
  const parsedPackage = JSON.parse(fs.readFileSync(packageJsonPath).toString());

  if (parsedPackage.name === "lauf-monorepo") {
    //only manipulate workspace packages
    continue;
  }

  const scriptNode = parsedPackage["scripts"];
  const incorrectEntries = Object.entries(
    findIncorrectValues(scriptNode, correctScriptValues, options)
  );
  if (incorrectEntries.length > 0) {
    console.log(`Found incorrect pairs in ${packageJsonPath}`);
    for (const [name, incorrectValue] of incorrectEntries) {
      const correctValue =
        correctScriptValues[name as keyof typeof correctScriptValues];
      console.log(
        `${name} should be ${JSON.stringify(
          correctValue
        )}. Actually found ${incorrectValue}`
      );
    }
    if (options.fix) {
      console.log("FIXING...");
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(parsedPackage, null, "  ")
      );
    }
  }
}
