export type Watcher<T> = (item: T) => any;

export type Unwatch = () => void;

export interface Watchable<T> {
  watch: (watcher: Watcher<T>) => Unwatch;
}

export interface WatchableValue<T> extends Watchable<T> {
  setValue: (value: T) => T;
  getValue: () => T;
}
