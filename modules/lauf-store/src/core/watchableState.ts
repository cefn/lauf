import { WatchableState, Watcher } from "../types";
import { DefaultWatchable } from "./watchable";

export class DefaultWatchableState<Value>
  extends DefaultWatchable<Value>
  implements WatchableState<Value> {
  protected value!: Value;
  constructor(value: Value, watchers?: ReadonlyArray<Watcher<Value>>) {
    super(watchers);
    this.write(value);
  }

  write = (value: Value) => {
    this.value = value;
    void this.notify(value);
    return value;
  };

  read = () => {
    return this.value;
  };
}
