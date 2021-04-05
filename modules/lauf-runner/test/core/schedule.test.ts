import lodashShuffle from "lodash/shuffle";
import {
  raceWait,
  teamWait,
  timeoutWait,
  wait,
  promiseExpiry,
  expire,
  Expiry,
  isExpiry,
  ActionPlan,
  performPlan,
  backgroundAllPlans,
} from "@lauf/lauf-runner";

describe("Foreground and Background operations", () => {
  const delayMs = 10;
  const simplePlan: ActionPlan<[], Expiry, Expiry> = function* () {
    return yield* expire(delayMs);
  };

  test("yield* executes inner plan to completion", async () => {
    const result = await performPlan(function* () {
      return yield* simplePlan();
    });
    expect(isExpiry(result)).toBeTruthy();
  });

  test("team() : executes inner plans in parallel to completion", async () => {
    const before = new Date().getTime();
    const planGroup: Array<ActionPlan<[], Expiry, Expiry>> = [
      simplePlan,
      simplePlan,
      simplePlan,
    ];
    const endings = await performPlan(function* () {
      const promises = yield* backgroundAllPlans(planGroup);
      const endings = yield* teamWait(promises);
      return endings;
    });
    const after = new Date().getTime();
    const duration = after - before;
    //it waited
    expect(duration).toBeGreaterThanOrEqual(delayMs * 0.5);
    //they were run in parallel, not series
    expect(duration).toBeLessThan(delayMs * planGroup.length);
    //they all completed
    expect(endings.every(isExpiry)).toBeTruthy();
  });

  test("backgroundAll : yields array of completion promises", async () => {
    const before = new Date().getTime();
    const planGroup: Array<ActionPlan<[], Expiry, Expiry>> = [
      simplePlan,
      simplePlan,
      simplePlan,
    ];
    const endingPromises = await performPlan(function* () {
      return yield* backgroundAllPlans(planGroup);
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
    const result = await performPlan(function* () {
      return yield* wait(specialPromise);
    });
    expect(result).toStrictEqual(special);
  });

  test("race : executes sequences in parallel, yields winning [result,sequence]", async () => {
    const goldPromise = promiseExpiry(2).then(() => "gold");
    const silverPromise = promiseExpiry(4).then(() => "silver");
    const bronzePromise = promiseExpiry(6).then(() => "bronze");
    const [ending, sequence] = await performPlan(function* () {
      return yield* raceWait(
        lodashShuffle([goldPromise, silverPromise, bronzePromise])
      );
    });
    expect(ending).toStrictEqual("gold");
    expect(sequence).toStrictEqual(goldPromise);
  });

  test("timeout : handles sequence success ", async () => {
    const delayMs = 2;
    const timeoutMs = 10;
    const quickPromise = promiseExpiry(delayMs).then(() => "success");
    const quickResult = await performPlan(function* () {
      return yield* timeoutWait(quickPromise, timeoutMs);
    });
    expect(quickResult).toStrictEqual("success");
    expect(isExpiry(quickResult)).toBeFalsy();
  });

  test("timeout : handles sequence failure", async () => {
    const delayMs = 10;
    const timeoutMs = 2;
    const slowPromise = promiseExpiry(delayMs).then(() => "success");
    const slowResult = await performPlan(function* () {
      return yield* timeoutWait(slowPromise, timeoutMs);
    });
    expect(slowResult).not.toEqual("success");
    expect(isExpiry(slowResult)).toBeTruthy();
  });

  test("team : waits for all sequences to complete", async () => {
    const goldPromise = promiseExpiry(2).then(() => "gold");
    const silverPromise = promiseExpiry(4).then(() => "silver");
    const bronzePromise = promiseExpiry(6).then(() => "bronze");
    const before = new Date().getTime();
    const result = await performPlan(function* () {
      return yield* teamWait(
        lodashShuffle([goldPromise, silverPromise, bronzePromise])
      );
    });
    const after = new Date().getTime();
    const duration = after - before;
    //get all results
    expect(result).toContain("gold");
    expect(result).toContain("silver");
    expect(result).toContain("bronze");
    //waited for slowest
    expect(duration).toBeGreaterThanOrEqual(5);
  });
});
