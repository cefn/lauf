import assert from "assert";
import { Script } from "@lauf/lauf-runner/types";
import { stageScript } from "@lauf/lauf-runner/core/util";
import { Delay, delay } from "@lauf/lauf-runner/core/delay";

describe("Define, run and regression test simple script", () => {
  const script: Script<[], number> = function* () {
    const beforeMs = new Date().getTime();
    for (let i = 0; i < 3; i++) {
      yield* delay(i);
    }
    const afterMs = new Date().getTime();
    return afterMs - beforeMs;
  };

  test("Run script", async () => {
    const totalMs = await stageScript(script);
    expect(totalMs).toBeGreaterThan(3);
  });

  test("Regression-test script", async () => {
    let step;
    const performance = script();

    step = performance.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Delay);
    expect((step.value as Delay).ms).toBe(0);

    step = performance.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Delay);
    expect((step.value as Delay).ms).toBe(1);

    step = performance.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Delay);
    expect((step.value as Delay).ms).toBe(2);

    step = performance.next(undefined);
    assert(step.done === true);
    expect(typeof step.value).toBe("number");
  });
});
