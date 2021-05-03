import { ActionSequence, call } from "@lauf/lauf-runner";
import { BasicStore, Store } from "@lauf/lauf-store/src";
import { Tracker } from "../src";

interface State {
  counter: number;
}

function* countPlan(store: Store<State>): ActionSequence<void, any> {
  for (const i of [3, 4, 5]) {
    yield* call(store.edit, (state) => {
      state.counter = i;
    });
  }
}

describe("Track actions and reactions from running sequences", () => {
  test("Actions and Reactions are performed as usual", async () => {
    const store = new BasicStore<State>({ counter: 0 });
    const tracker = new Tracker(store);
    await tracker.performPlan(countPlan, store);
    expect(store.read()).toEqual({ counter: 5 });
  });

  // test("", () => {});
});
