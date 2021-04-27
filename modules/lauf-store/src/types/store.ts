import type { Immutable, Editor } from "./immutable";
import { WatchableValue } from "./watchable";

export interface Store<State> extends WatchableValue<Immutable<State>> {
  edit: (editor: Editor<State>) => Immutable<State>;
  select: <Selected>(
    selector: Selector<State, Selected>
  ) => Immutable<Selected>;
  partition: Partitioner<State>;
}

export type Selector<State, Selected> = (
  state: Immutable<State>
) => Immutable<Selected>;

export type Partitioner<State> = <Key extends keyof State>(
  key: Key
) => Store<State[Key]>;

export type FilterValues<T, V> = {
  [K in keyof T]: T[K] extends V ? T[K] : never;
};

export type ObjectParent = FilterValues<{}, object>;
