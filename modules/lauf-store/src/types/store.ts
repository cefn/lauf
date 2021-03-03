import type { Immutable, Editor } from "./immutable";
import { WatchableValue } from "./watchable";

export interface Store<Value> extends WatchableValue<Immutable<Value>> {
  editValue: (editor: Editor<Immutable<Value>>) => Immutable<Value>;
}

export type Selector<Value, Selected = any> = (
  value: Immutable<Value>
) => Selected;
