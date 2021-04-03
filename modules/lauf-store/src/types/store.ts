import type { Immutable, Editor } from "./immutable";
import { WatchableValue } from "./watchable";

export interface Store<State> extends WatchableValue<Immutable<State>> {
  edit: (editor: Editor<State>) => Immutable<State>;
  select: <Selected>(
    selector: Selector<State, Selected>
  ) => Immutable<Selected>;
}

export type Selector<State, Selected = any> = (
  state: Immutable<State>
) => Immutable<Selected>;
