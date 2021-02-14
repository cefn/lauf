import lodashShuffle from "lodash/shuffle";
import {
  background,
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

describe("Scheduling Action Sequences", () => {
  test("run : executes inner procedure to completion", async () => {
    const inner: RootProcedure<Expiry> = function* () {
      return yield* delay(10);
    };
    const outer: RootProcedure<Expiry> = function* () {
      return yield* background(inner);
    };
    const result = await executeRootProcedure(outer);
    expect(isExpiry(result)).toBeTruthy();
  });

  test("runAll : executes inner procedures in parallel to completion", async () => {
    const innerProcedures: RootProcedure<Expiry>[] = [
      function* () {
        return yield* delay(15);
      },
      function* () {
        return yield* delay(15);
      },
      function* () {
        return yield* delay(15);
      },
    ];
    const before = new Date().getTime();
    const allOutcomes = await executeRootProcedure(function* () {
      return yield* backgroundAll(innerProcedures);
    });
    const after = new Date().getTime();
    const duration = after - before;
    expect(duration).toBeGreaterThan(10);
    expect(duration).toBeLessThan(30);
    expect(allOutcomes.every(isExpiry)).toBeTruthy();
  });

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

  test("race : executes multiple first result and sequence ", async () => {
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
    const quickSequence = wait(promiseDelay(1).then(() => "success"));
    const quickResult = await executeRootProcedure(function* () {
      return yield* timeout(quickSequence, 5);
    });
    expect(quickResult).toStrictEqual("success");
    expect(isExpiry(quickResult)).toBeFalsy();
  });

  test("timeout : handles failure sequence ", async () => {
    const slowSequence = wait(promiseDelay(10).then(() => "success"));
    const slowResult = await executeRootProcedure(function* () {
      return yield* timeout(slowSequence, 5);
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
