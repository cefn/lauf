import { Store } from "@lauf/lauf-store";
import { ActionSequence, call, wait, backgroundPlan } from "@lauf/lauf-runner";

export interface State {
  counter: number;
}

export const initialState: State = { counter: 0 } as const;

export function* countPlan(store: Store<State>): ActionSequence<void, any> {
  for (const i of [3, 4, 5]) {
    yield* call(store.edit, (state) => {
      state.counter = i;
    });
  }
}

export function* forkingCountPlan(
  store: Store<State>
): ActionSequence<void, any> {
  const [countPromise] = yield* backgroundPlan(countPlan, store);
  yield* wait(countPromise);
}
