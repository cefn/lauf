import type { Immutable, Editor } from "./immutable";
import type { Unwatch, Watchable, WatchableValue } from "./watchable";

export interface Store<T> extends WatchableValue<Immutable<T>> {
  editValue: (editor: Editor<Immutable<T>>) => Immutable<T>;
}

export interface Stream<In, Out = In> extends Watchable<Out> {
  source(watchable: Watchable<In>): Unwatch;
}
