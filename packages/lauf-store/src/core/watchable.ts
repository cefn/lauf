import { Watchable, WatchableValue, Watcher } from "../types/watchable";

export class BasicWatchable<T> implements Watchable<T> {
  protected watchers: ReadonlyArray<Watcher<T>>;
  constructor(watchers: ReadonlyArray<Watcher<T>> = []) {
    this.watchers = watchers;
  }
  protected notify(item: T) {
    for (const watcher of this.watchers) {
      watcher(item);
    }
  }
  watch(watcher: Watcher<T>) {
    this.watchers = [...this.watchers, watcher];
    return () => {
      this.watchers = this.watchers.filter(
        (candidate) => candidate !== watcher
      );
    };
  }
}

export class BasicWatchableValue<T>
  extends BasicWatchable<T>
  implements WatchableValue<T> {
  protected value!: T;
  constructor(value: T, watchers?: ReadonlyArray<Watcher<T>>) {
    super(watchers);
    this.setValue(value);
  }
  setValue(value: T) {
    this.value = value;
    this.notify(value);
    return value;
  }
  getValue() {
    return this.value;
  }
}
