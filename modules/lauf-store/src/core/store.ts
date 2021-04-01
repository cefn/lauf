import type { Selector, Store } from "../types";
import type { Editor, Immutable } from "../types/immutable";
import { BasicWatchableValue } from "./watchable";
import { produce } from "immer";

export class BasicStore<T>
  extends BasicWatchableValue<Immutable<T>>
  implements Store<T> {
  edit(editor: Editor<T>) {
    const nextValue = (produce<Immutable<T>>(
      this.read(),
      editor
    ) as unknown) as Immutable<T>;
    return this.write(nextValue);
  }
  select<Selected>(selector: Selector<T, Selected>) {
    return selector(this.read());
  }
}
