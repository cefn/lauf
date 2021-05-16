#!/usr/bin/env -S npx ts-node
import assert from "assert";
import fs from "fs";
import { dirname, sep } from "path";
import glob from "glob";
import { isDeepStrictEqual } from "util";
import yargs from "yargs";
import minimatch from "minimatch";
import lodashGet from "lodash/get";
import lodashSet from "lodash/set";
import chalk from "chalk";
import { PackageJson } from "type-fest";

let failed = false;

try {
  const { strategy, filterPackages, filterPaths } = yargs
    .option("strategy", {
      description: "Select validation strategy",
      type: "string",
      default: "dryRun",
      choices: ["dryRun", "fixErrors", "fixWarnings"],
    })
    .option("filterPackages", {
      description: "Filter pattern for package names",
      type: "string",
    })
    .option("filterPaths", {
      description: "Filter pattern for property names",
      type: "string",
    })
    .help()
    .alias("help", "h").argv;

  const jsonPaths = glob.sync("**/package.json", {
    ignore: "**/node_modules/**/package.json",
  });

  interface Package {
    json: PackageJson;
    jsonPath: string;
  }

  abstract class PackageValidation {
    constructor(readonly severity: Severity) {}
    abstract pass(pkg: Package): boolean;
    abstract report(pkg: Package): string;
    abstract fix(pkg: Package): void;
  }

  class NameValidation extends PackageValidation {
    name({ jsonPath }: Package) {
      const [groupName, packageName] = dirname(jsonPath).split(sep).slice(-2);
      if (groupName === "apps") {
        return packageName;
      } else if (groupName === "modules" || groupName === "draft") {
        return `@lauf/${packageName}`;
      }
      throw new Error(`Unexpected package path ${chalk.redBright(jsonPath)}`);
    }
    pass(pkg: Package) {
      return pkg.json.name === this.name(pkg);
    }
    report(pkg: Package) {
      if (this.pass(pkg)) {
        return chalk.green(`${this.name(pkg)} named correctly`);
      }
      return `${this.name(pkg)} actually named '${chalk.redBright(
        pkg.json.name
      )}'!`;
    }
    fix(pkg: Package) {
      pkg.json.name = this.name(pkg);
    }
  }

  /** Validates a path in package JSON is set to specific value */
  class AttributeValidation extends PackageValidation {
    /**
     * @param path - The path to get/set within package.json (lodash)
     * @param expected - The value or pattern expected at that path
     * @param severity - The severity if this doesn't pass
     */
    constructor(
      readonly path: string,
      readonly expected: string,
      severity: Severity
    ) {
      super(severity);
    }
    actual({ json }: Package) {
      return lodashGet(json, this.path) as string;
    }
    pass(pkg: Package) {
      return isDeepStrictEqual(this.actual(pkg), this.expected);
    }
    report(pkg: Package) {
      if (this.pass(pkg)) {
        return chalk.green(`${this.path}==='${this.expected}'`);
      }
      return `${this.path}!=='${chalk.green(
        this.expected
      )}' actually '${chalk.redBright(this.actual(pkg))}'!`;
    }
    fix({ json }: Package) {
      lodashSet(json, this.path, this.expected);
    }
  }

  type Severity =
    | "warning" //report violation
    | "error"; //fail on violation

  const RULES: ReadonlyArray<PackageValidation> = [
    new NameValidation("error"),
    new AttributeValidation("scripts.test", "jest", "warning"),
    new AttributeValidation("scripts.check", "tsc --noEmit", "error"),
    new AttributeValidation("devDependencies.typescript", "^4.2.2", "error"),
  ] as const;

  for (const jsonPath of jsonPaths) {
    const json = JSON.parse(fs.readFileSync(jsonPath).toString());

    if (filterPackages) {
      if (!minimatch(json.name, filterPackages)) {
        continue;
      }
    }

    //skip workspace root
    if (json.workspaces) {
      console.log(chalk.green(`Skipping workspace root ${json.name}`));
      assert(json.name === "lauf-monorepo");
      continue;
    }

    //traverse package json tree, checking and (optionally) fixing
    const found: { message: string }[] = [];
    let rewritePackageJson = false;
    for (const rule of RULES) {
      if (filterPaths && rule instanceof AttributeValidation) {
        if (!minimatch(rule.path, filterPaths)) {
          continue;
        }
      }

      const pkg = { json, jsonPath };
      if (!rule.pass(pkg)) {
        //record violation
        let violationColor: typeof chalk.redBright = chalk.redBright;
        if (rule.severity === "error") {
          //exit status
          failed = true;
        } else if (rule.severity === "warning") {
          violationColor = chalk.yellow;
        } else {
          throw new Error(`Unexpected status`);
        }
        //check strategy, possibly skip fix depending on rule status
        const skip =
          (rule.severity === "error" && ["dryRun"].includes(strategy)) ||
          (rule.severity === "warning" &&
            ["dryRun", "fixWarnings"].includes(strategy));

        //record a message
        const message = `${violationColor(
          rule.severity.toUpperCase()
        )} ${rule.report(pkg)}`;
        found.push({ message });

        if (skip) {
          //skip the fix
          continue;
        } else {
          //proceed with fix
          rule.fix(pkg);
          rewritePackageJson = true;
        }
      }
    }

    if (Object.entries(found).length > 0) {
      console.log(`${json.name} (${chalk.gray(jsonPath)})`);
      for (const { message } of found) {
        console.log(message);
      }
    }

    if (rewritePackageJson) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, "  "));
    }
  }
} catch (e) {
  failed = true;
  console.log(chalk.redBright("ERROR"), e.message || e);
  throw e;
} finally {
  if (failed) {
    process.exit(-1);
  }
}
