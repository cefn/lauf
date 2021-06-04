import { WatchableValue, Watcher } from "../types";
import { BasicWatchable } from "./watchable";

export class BasicWatchableValue<Value>
  extends BasicWatchable<Value>
  implements WatchableValue<Value> {
  protected value!: Value;
  constructor(value: Value, watchers?: ReadonlyArray<Watcher<Value>>) {
    super(watchers);
    this.write(value);
  }
  write = (value: Value) => {
    this.value = value;
    this.notify(value);
    return value;
  };
  read = () => {
    return this.value;
  };
}
