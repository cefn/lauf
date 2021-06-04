export type Watcher<T> = (item: T) => unknown;

export type Unwatch = () => void;

export interface Watchable<T> {
  watch: (watcher: Watcher<T>) => Unwatch;
}

export interface WatchableValue<T> extends Watchable<T> {
  write: (value: T) => T;
  read: () => T;
}
