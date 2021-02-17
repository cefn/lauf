import assert from "assert";
import { RootProcedure } from "@lauf/lauf-runner/types";
import { executeProcedure } from "@lauf/lauf-runner/core/util";
import { Delay, delay } from "@lauf/lauf-runner/core/delay";

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
    const totalMs = await executeProcedure(procedure);
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
