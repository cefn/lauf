import { Watchable, WatchableValue, Watcher } from "../types/watchable";

export class BasicWatchable<Value> implements Watchable<Value> {
  protected watchers: ReadonlyArray<Watcher<Value>>;
  constructor(watchers: ReadonlyArray<Watcher<Value>> = []) {
    this.watchers = watchers;
  }
  protected notify = (item: Value) => {
    for (const watcher of this.watchers) {
      watcher(item);
    }
  };
  watch = (watcher: Watcher<Value>) => {
    this.watchers = [...this.watchers, watcher];
    return () => {
      this.watchers = this.watchers.filter(
        (candidate) => candidate !== watcher
      );
    };
  };
}

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
