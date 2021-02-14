import { RootProcedure } from "@lauf/lauf-runner/types";
import { executeRootProcedure } from "@lauf/lauf-runner/core/util";

import { Delay, delay } from "../src/domain/delay";
import assert from "assert";

describe("Define, run and regression test simple procedure", () => {
  const procedure: RootProcedure<number> = function* () {
    const beforeMs = new Date().getTime();
    for (let i = 0; i < 3; i++) {
      yield* delay(i);
    }
    const afterMs = new Date().getTime();
    return afterMs - beforeMs;
  };

  test("Run procedure", async () => {
    const totalMs = await executeRootProcedure(procedure);
    expect(totalMs).toBeGreaterThan(3);
  });

  test("Regression-test procedure", async () => {
    let step;
    const sequence = procedure();

    step = sequence.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Delay);
    expect((step.value as Delay).ms).toBe(0);

    step = sequence.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Delay);
    expect((step.value as Delay).ms).toBe(1);

    step = sequence.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Delay);
    expect((step.value as Delay).ms).toBe(2);

    step = sequence.next(undefined);
    assert(step.done === true);
    expect(typeof step.value).toBe("number");
  });
});
