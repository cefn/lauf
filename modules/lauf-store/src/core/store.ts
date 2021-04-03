import type { Selector, Store } from "../types";
import type { Editor, Immutable } from "../types/immutable";
import { BasicWatchableValue } from "./watchable";
import { produce } from "immer";

export class BasicStore<State>
  extends BasicWatchableValue<Immutable<State>>
  implements Store<State> {
  edit(editor: Editor<State>) {
    const nextState = (produce<Immutable<State>>(
      this.read(),
      editor
    ) as unknown) as Immutable<State>;
    return this.write(nextState);
  }
  select<Selected>(selector: Selector<State, Selected>) {
    return selector(this.read());
  }
}
