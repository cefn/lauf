import lodashShuffle from "lodash/shuffle";
import {
  foregroundScript,
  foregroundAllScripts,
  backgroundAllScripts,
  race,
  team,
  timeout,
  wait,
} from "@lauf/lauf-runner/core/schedule";
import {
  promiseDelay,
  delay,
  Expiry,
  isExpiry,
} from "@lauf/lauf-runner/core/delay";
import { Script } from "@lauf/lauf-runner/types";
import { stageScript } from "@lauf/lauf-runner/core/util";

describe("Foreground and Background operations", () => {
  const delayMs = 10;
  const simpleScript: Script<[], Expiry> = function* () {
    return yield* delay(delayMs);
  };

  const scriptGroup: Script<[], Expiry>[] = [
    simpleScript,
    simpleScript,
    simpleScript,
  ];

  test("foreground : executes inner script to completion", async () => {
    const result = await stageScript(function* () {
      return yield* foregroundScript(simpleScript);
    });
    expect(isExpiry(result)).toBeTruthy();
  });

  test("foregroundAll : executes inner scripts in parallel to completion", async () => {
    const before = new Date().getTime();
    const endings = await stageScript<Expiry[]>(function* () {
      return yield* foregroundAllScripts(scriptGroup);
    });
    const after = new Date().getTime();
    const duration = after - before;
    //it waited
    expect(duration).toBeGreaterThan(delayMs);
    //they were run in parallel, not series
    expect(duration).toBeLessThan(delayMs * scriptGroup.length);
    //they all completed
    expect(endings.every(isExpiry)).toBeTruthy();
  });

  test("backgroundAll : yields array of completion promises", async () => {
    const before = new Date().getTime();
    const endingPromises = await stageScript(function* () {
      return yield* backgroundAllScripts(scriptGroup);
    });
    const after = new Date().getTime();
    const duration = after - before;
    //it didn't wait for any to complete
    expect(duration).toBeLessThan(delayMs);
    //it returned promises
    expect(
      endingPromises.every((promise) => promise instanceof Promise)
    ).toBeTruthy();
    //they can be resolved later
    const endings = await Promise.all(endingPromises);
    expect(endings.every(isExpiry)).toBeTruthy();
  });
});
describe("Scheduling Action Sequences", () => {
  test("wait : waits on result of any promise", async () => {
    const special = ["special"];
    const specialPromise = new Promise((resolve) =>
      setTimeout(() => resolve(special), 10)
    );
    const result = await stageScript(function* () {
      return yield* wait(specialPromise);
    });
    expect(result).toStrictEqual(special);
  });

  test("race : executes performances in parallel, yields winning [result,performance]", async () => {
    const gold = wait(promiseDelay(2).then(() => "gold"));
    const silver = wait(promiseDelay(4).then(() => "silver"));
    const bronze = wait(promiseDelay(6).then(() => "bronze"));
    const performances = lodashShuffle([gold, silver, bronze]);
    const [ending, performance] = await stageScript(function* () {
      return yield* race(performances);
    });
    expect(ending).toStrictEqual("gold");
    expect(performance).toStrictEqual(gold);
  });

  test("timeout : handles performance success ", async () => {
    const delayMs = 2;
    const timeoutMs = 10;
    const quickSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const quickResult = await stageScript(function* () {
      return yield* timeout(quickSequence, timeoutMs);
    });
    expect(quickResult).toStrictEqual("success");
    expect(isExpiry(quickResult)).toBeFalsy();
  });

  test("timeout : handles performance failure", async () => {
    const delayMs = 10;
    const timeoutMs = 2;
    const slowSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const slowResult = await stageScript(function* () {
      return yield* timeout(slowSequence, timeoutMs);
    });
    expect(slowResult).not.toEqual("success");
    expect(isExpiry(slowResult)).toBeTruthy();
  });

  test("team : waits for all performances to complete", async () => {
    const performances = [
      wait(promiseDelay(6).then(() => "silver")),
      wait(promiseDelay(3).then(() => "gold")),
      wait(promiseDelay(9).then(() => "bronze")),
    ];
    const before = new Date().getTime();
    const result = await stageScript(function* () {
      return yield* team(performances);
    });
    const after = new Date().getTime();
    const duration = after - before;
    expect(result).toEqual(["silver", "gold", "bronze"]); //get all results
    expect(duration).toBeGreaterThanOrEqual(8); //waited for slowest
  });
});
