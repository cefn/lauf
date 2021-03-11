#!/usr/bin/env -S npx ts-node
import fs from "fs";
import glob from "glob";
import { isDeepStrictEqual } from "util";

type PackageEntry = Record<string, any>;

//Retrieve workspace package.json paths.
//Excludes node_modules' package.json
const packageJsonPaths = glob.sync("**/package.json", {
  ignore: "**/node_modules/**/package.json",
});

function findIncorrectValues(
  packageNode: PackageEntry,
  correctValues: PackageEntry,
  fix = false
) {
  const incorrectValues: PackageEntry = {};
  for (const [name, correctValue] of Object.entries(correctValues)) {
    const actualValue = packageNode[name];
    if (!isDeepStrictEqual(actualValue, correctValue)) {
      incorrectValues[name] = actualValue;
      if (fix) {
        packageNode[name] = correctValue;
      }
    }
  }
  return incorrectValues;
}

const correctScriptValues = {
  test: "jest",
} as const;

for (const packageJsonPath of packageJsonPaths) {
  const parsedPackage = JSON.parse(fs.readFileSync(packageJsonPath).toString());

  if (parsedPackage.name === "lauf-monorepo") {
    //only manipulate workspace packages
    continue;
  }

  const scriptNode = parsedPackage["scripts"];
  const incorrectEntries = Object.entries(
    findIncorrectValues(scriptNode, correctScriptValues)
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
  }
}
