import type { Selector, Store } from "../types";
import type { Editor, Immutable } from "../types/immutable";
import { BasicWatchableValue } from "./watchable";
import { produce } from "immer";

export class BasicStore<T>
  extends BasicWatchableValue<Immutable<T>>
  implements Store<T> {
  edit(editor: Editor<Immutable<T>>) {
    const nextValue = (produce<Immutable<T>>(
      this.getValue(),
      editor
    ) as unknown) as Immutable<T>;
    return this.setValue(nextValue);
  }
  select<Selected>(selector: Selector<T, Selected>) {
    return selector(this.getValue());
  }
}
