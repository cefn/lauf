import assert from "assert";
import {
  ActionPlan,
  performPlan,
  Expire,
  expire,
  Expiry,
  Call,
  call,
  planOfFunction,
  EXPIRY,
} from "@lauf/lauf-runner";

describe("Define, run and regression test simple plan", () => {
  const plan: ActionPlan<[], number, Expiry> = function* () {
    const beforeMs = new Date().getTime();
    for (let i = 0; i < 3; i++) {
      yield* expire(i);
    }
    const afterMs = new Date().getTime();
    return afterMs - beforeMs;
  };

  test("Run plan", async () => {
    const totalMs = await performPlan(plan);
    expect(totalMs).toBeGreaterThan(2); //explicit delays are 0, 1, 2
  });

  test("Regression-test plan, mocking delays", async () => {
    let step;
    const sequence = plan();

    step = sequence.next();
    assert(step.done === false);
    assert(step.value instanceof Expire);
    expect((step.value as Expire).ms).toBe(0);

    step = sequence.next(EXPIRY);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Expire);
    expect((step.value as Expire).ms).toBe(1);

    step = sequence.next(EXPIRY);
    assert(step.done === false);
    expect(step.value).toBeInstanceOf(Expire);
    expect((step.value as Expire).ms).toBe(2);

    step = sequence.next(EXPIRY);
    assert(step.done === true);
    expect(typeof step.value).toBe("number");
    //accelerated run with no delays
    expect(step.value).toBeLessThan(3);
  });
});

describe("Call primitive can trigger invocation of async function", () => {
  //define a dummy async function accepting a string, calling a spy
  const spy = jest.fn();
  const fn = async (val: string) => spy(val);

  test("Simple yield of Call action triggers async function", async () => {
    spy.mockReset();
    //define the plan
    function* plan() {
      yield new Call(fn, "foo");
    }
    //run the plan
    await performPlan(plan);
    //check spy was called
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("foo");
  });

  test("Delegating yield to ActionSequence created by call() plan triggers async function", async () => {
    spy.mockReset();
    //define the plan
    function* plan() {
      yield* call(fn, "bar");
    }
    //run the plan
    await performPlan(plan);
    //check spy was called
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("bar");
  });

  test("planOfAsync creates a plan bound to async function. Delegating yield to new plan triggers async function", async () => {
    spy.mockReset();
    //define bound plan
    const fnPlan = planOfFunction(fn);
    //define the plan
    function* plan() {
      yield* fnPlan("bar");
    }
    //run the plan
    await performPlan(plan);
    //check spy was called
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("bar");
  });
});
