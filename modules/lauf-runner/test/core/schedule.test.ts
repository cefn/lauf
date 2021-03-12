import lodashShuffle from "lodash/shuffle";
import {
  raceWait,
  teamWait,
  timeoutWait,
  wait,
  promiseDelay,
  expire,
  Expiry,
  isExpiry,
  ActionPlan,
  performPlan,
  background,
  backgroundAll,
  ActionSequence,
} from "@lauf/lauf-runner";

describe("Foreground and Background operations", () => {
  const delayMs = 10;
  const simplePlan: ActionPlan<[], Expiry> = function* () {
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
    const sequenceGroup: ActionSequence<Expiry>[] = [
      simplePlan(),
      simplePlan(),
      simplePlan(),
    ];
    const endings = await performPlan<Expiry[], any>(function* () {
      const promises = yield* backgroundAll<Expiry, typeof sequenceGroup>(
        sequenceGroup
      );
      const endings = yield* teamWait(promises);
      return endings;
    });
    const after = new Date().getTime();
    const duration = after - before;
    //it waited
    expect(duration).toBeGreaterThanOrEqual(delayMs);
    //they were run in parallel, not series
    expect(duration).toBeLessThan(delayMs * sequenceGroup.length);
    //they all completed
    expect(endings.every(isExpiry)).toBeTruthy();
  });

  test("backgroundAll : yields array of completion promises", async () => {
    const before = new Date().getTime();
    const sequenceGroup: ActionSequence<Expiry>[] = [
      simplePlan(),
      simplePlan(),
      simplePlan(),
    ];
    const endingPromises = await performPlan(function* () {
      return yield* backgroundAll(sequenceGroup);
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
    let goldPromise, silverPromise, bronzePromise;
    const [ending, sequence] = await performPlan(function* () {
      const promises = yield* backgroundAll([
        wait(promiseDelay(2).then(() => "gold")),
        wait(promiseDelay(4).then(() => "silver")),
        wait(promiseDelay(6).then(() => "bronze")),
      ]);
      [goldPromise, silverPromise, bronzePromise] = promises;
      return yield* raceWait(lodashShuffle(promises));
    });
    expect(ending).toStrictEqual("gold");
    expect(sequence).toStrictEqual(goldPromise);
  });

  test("timeout : handles sequence success ", async () => {
    const delayMs = 2;
    const timeoutMs = 10;
    const quickSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const quickResult = await performPlan(function* () {
      const [promise] = yield* background(quickSequence);
      return yield* timeoutWait(promise, timeoutMs);
    });
    expect(quickResult).toStrictEqual("success");
    expect(isExpiry(quickResult)).toBeFalsy();
  });

  test("timeout : handles sequence failure", async () => {
    const delayMs = 10;
    const timeoutMs = 2;
    const slowSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const slowResult = await performPlan(function* () {
      const [promise] = yield* background(slowSequence);
      return yield* timeoutWait(promise, timeoutMs);
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
    const result = await performPlan(function* () {
      const promises = yield* backgroundAll(sequences);
      return yield* teamWait(promises);
    });
    const after = new Date().getTime();
    const duration = after - before;
    expect(result).toEqual(["silver", "gold", "bronze"]); //get all results
    expect(duration).toBeGreaterThanOrEqual(8); //waited for slowest
  });
});
