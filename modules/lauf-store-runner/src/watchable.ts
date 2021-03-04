import { Action, planOfAction } from "@lauf/lauf-runner";
import { WatchableValue } from "@lauf/lauf-store";

class GetValue<T> implements Action<T> {
  constructor(readonly watchableValue: WatchableValue<T>) {}
  act() {
    return this.watchableValue.getValue();
  }
}

class SetValue<T> implements Action<T> {
  constructor(readonly watchableValue: WatchableValue<T>, readonly value: T) {}
  act() {
    return this.watchableValue.setValue(this.value);
  }
}

export const getValue = planOfAction(GetValue);
export const setValue = planOfAction(SetValue);
