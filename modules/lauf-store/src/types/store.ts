import type { Immutable, Editor } from "./immutable";
import { WatchableValue } from "./watchable";

export interface Store<Value> extends WatchableValue<Immutable<Value>> {
  edit: (editor: Editor<Immutable<Value>>) => Immutable<Value>;
  select: <Selected>(selector: Selector<Value, Selected>) => Selected;
}

export type Selector<Value, Selected = any> = (
  value: Immutable<Value>
) => Selected;
