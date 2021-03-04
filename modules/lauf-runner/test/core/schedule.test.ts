import lodashShuffle from "lodash/shuffle";
import {
  foregroundPlan,
  foregroundAllPlans,
  backgroundAllPlans,
  race,
  team,
  timeout,
  wait,
  promiseDelay,
  delay,
  Expiry,
  isExpiry,
  ActionPlan,
  performPlan,
} from "@lauf/lauf-runner";

describe("Foreground and Background operations", () => {
  const delayMs = 10;
  const simplePlan: ActionPlan<[], Expiry> = function* () {
    return yield* delay(delayMs);
  };

  const planGroup: ActionPlan<[], Expiry>[] = [
    simplePlan,
    simplePlan,
    simplePlan,
  ];

  test("foreground : executes inner plan to completion", async () => {
    const result = await performPlan(function* () {
      return yield* foregroundPlan(simplePlan);
    });
    expect(isExpiry(result)).toBeTruthy();
  });

  test("foregroundAll : executes inner plans in parallel to completion", async () => {
    const before = new Date().getTime();
    const endings = await performPlan<Expiry[], any>(function* () {
      return yield* foregroundAllPlans(planGroup);
    });
    const after = new Date().getTime();
    const duration = after - before;
    //it waited
    expect(duration).toBeGreaterThanOrEqual(delayMs);
    //they were run in parallel, not series
    expect(duration).toBeLessThan(delayMs * planGroup.length);
    //they all completed
    expect(endings.every(isExpiry)).toBeTruthy();
  });

  test("backgroundAll : yields array of completion promises", async () => {
    const before = new Date().getTime();
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
    const gold = wait(promiseDelay(2).then(() => "gold"));
    const silver = wait(promiseDelay(4).then(() => "silver"));
    const bronze = wait(promiseDelay(6).then(() => "bronze"));
    const sequences = lodashShuffle([gold, silver, bronze]);
    const [ending, sequence] = await performPlan(function* () {
      return yield* race(sequences);
    });
    expect(ending).toStrictEqual("gold");
    expect(sequence).toStrictEqual(gold);
  });

  test("timeout : handles sequence success ", async () => {
    const delayMs = 2;
    const timeoutMs = 10;
    const quickSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const quickResult = await performPlan(function* () {
      return yield* timeout(quickSequence, timeoutMs);
    });
    expect(quickResult).toStrictEqual("success");
    expect(isExpiry(quickResult)).toBeFalsy();
  });

  test("timeout : handles sequence failure", async () => {
    const delayMs = 10;
    const timeoutMs = 2;
    const slowSequence = wait(promiseDelay(delayMs).then(() => "success"));
    const slowResult = await performPlan(function* () {
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
    const result = await performPlan(function* () {
      return yield* team(sequences);
    });
    const after = new Date().getTime();
    const duration = after - before;
    expect(result).toEqual(["silver", "gold", "bronze"]); //get all results
    expect(duration).toBeGreaterThanOrEqual(8); //waited for slowest
  });
});
