import { Action, createActionProcedure } from "@lauf/lauf-runner";
import { Immutable } from "@lauf/lauf-store/types/immutable";
import { WatchableValue } from "@lauf/lauf-store/types/watchable";

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

export const getValue = createActionProcedure(GetValue);
export const setValue = createActionProcedure(SetValue);
