import lodashShuffle from "lodash/shuffle";
import {
  foreground,
  foregroundAll,
  backgroundAll,
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
} from "@lauf/lauf-runner/domain/delay";
import { RootProcedure } from "@lauf/lauf-runner/types";
import { executeRootProcedure } from "@lauf/lauf-runner/core/util";

describe("Foreground and Background operations", () => {
  const delayMs = 10;
  const simpleProcedure: RootProcedure<Expiry> = function* () {
    return yield* delay(delayMs);
  };

  const procedureGroup: RootProcedure<Expiry>[] = [
    simpleProcedure,
    simpleProcedure,
    simpleProcedure,
  ];

  test("foreground : executes inner procedure to completion", async () => {
    const result = await executeRootProcedure(function* () {
      return yield* foreground(simpleProcedure);
    });
    expect(isExpiry(result)).toBeTruthy();
  });

  test("foregroundAll : executes inner procedures in parallel to completion", async () => {
    const before = new Date().getTime();
    const outcomes = await executeRootProcedure(function* () {
      return yield* foregroundAll(procedureGroup);
    });
    const after = new Date().getTime();
    const duration = after - before;
    //it waited
    expect(duration).toBeGreaterThan(delayMs);
    //they were run in parallel, not series
    expect(duration).toBeLessThan(delayMs * procedureGroup.length);
    //they all completed
    expect(outcomes.every(isExpiry)).toBeTruthy();
  });

  test("backgroundAll : yields array of completion promises", async () => {
    const before = new Date().getTime();
    const outcomePromises = await executeRootProcedure(function* () {
      return yield* backgroundAll(procedureGroup);
    });
    const after = new Date().getTime();
    const duration = after - before;
    //it didn't wait for any to complete
    expect(duration).toBeLessThan(delayMs);
    //it returned promises
    expect(
      outcomePromises.every((promise) => promise instanceof Promise)
    ).toBeTruthy();
    //they can be resolved later
    const outcomes = await Promise.all(outcomePromises);
    expect(outcomes.every(isExpiry)).toBeTruthy();
  });
});
describe("Scheduling Action Sequences", () => {
  test("wait : waits on result of any promise", async () => {
    const special = ["special"];
    const specialPromise = new Promise((resolve) =>
      setTimeout(() => resolve(special), 10)
    );
    const result = await executeRootProcedure(function* () {
      return yield* wait(specialPromise);
    });
    expect(result).toStrictEqual(special);
  });

  test("race : executes sequences in parallel, yields winning [result,sequence]", async () => {
    const goldSequence = wait(promiseDelay(2).then(() => "gold"));
    const silverSequence = wait(promiseDelay(4).then(() => "silver"));
    const bronzeSequence = wait(promiseDelay(6).then(() => "bronze"));
    const sequences = lodashShuffle([
      goldSequence,
      silverSequence,
      bronzeSequence,
    ]);
    const [outcome, sequence] = await executeRootProcedure(function* () {
      return yield* race(sequences);
    });
    expect(outcome).toStrictEqual("gold");
    expect(sequence).toStrictEqual(goldSequence);
  });

  test("timeout : handles success sequence ", async () => {
    const delayMs = 2;
    const timeoutMs = 10;
    const quickSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const quickResult = await executeRootProcedure(function* () {
      return yield* timeout(quickSequence, timeoutMs);
    });
    expect(quickResult).toStrictEqual("success");
    expect(isExpiry(quickResult)).toBeFalsy();
  });

  test("timeout : handles failure sequence ", async () => {
    const delayMs = 10;
    const timeoutMs = 2;
    const slowSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const slowResult = await executeRootProcedure(function* () {
      return yield* timeout(slowSequence, timeoutMs);
    });
    expect(slowResult).not.toEqual("success");
    expect(isExpiry(slowResult)).toBeTruthy();
  });

  test("team : waits for all sequences to complete", async () => {
    const sequences = [
      wait(promiseDelay(6).then(() => "silver")),
      wait(promiseDelay(3).then(() => "gold")),
      wait(promiseDelay(9).then(() => "bronze")),
    ];
    const before = new Date().getTime();
    const result = await executeRootProcedure(function* () {
      return yield* team(sequences);
    });
    const after = new Date().getTime();
    const duration = after - before;
    expect(result).toEqual(["silver", "gold", "bronze"]); //get all results
    expect(duration).toBeGreaterThanOrEqual(8); //waited for slowest
  });
});
