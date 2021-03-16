import assert from "assert";
import { ActionPlan, performPlan, Expire, expire } from "@lauf/lauf-runner";

describe("Define, run and regression test simple plan", () => {
  const plan: ActionPlan<[], number> = function* () {
    const beforeMs = new Date().getTime();
    for (let i = 0; i < 3; i++) {
      yield* expire(i);
    }
    const afterMs = new Date().getTime();
    return afterMs - beforeMs;
  };

  test("Run plan", async () => {
    const totalMs = await performPlan(plan);
    expect(totalMs).toBeGreaterThan(3);
  });

  test("Regression-test plan", async () => {
    let step;
    const sequence = plan();

    step = sequence.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Expire);
    expect((step.value as Expire).ms).toBe(0);

    step = sequence.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Expire);
    expect((step.value as Expire).ms).toBe(1);

    step = sequence.next(undefined);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Expire);
    expect((step.value as Expire).ms).toBe(2);

    step = sequence.next(undefined);
    assert(step.done === true);
    expect(typeof step.value).toBe("number");
  });
});
