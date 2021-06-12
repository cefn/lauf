import { Action, planOfAction } from "@lauf/lauf-runner";
import { WatchableState } from "@lauf/lauf-store";

class GetValue<T> implements Action<T> {
  constructor(readonly watchableState: WatchableState<T>) {}
  act() {
    return this.watchableState.read();
  }
}

class SetValue<T> implements Action<T> {
  constructor(readonly watchableState: WatchableState<T>, readonly value: T) {}
  act() {
    return this.watchableState.write(this.value);
  }
}

export const getValue = planOfAction(GetValue);
export const setValue = planOfAction(SetValue);
