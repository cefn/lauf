import type { Store } from "../types";
import type { Editor, Immutable } from "../types/immutable";
import { BasicWatchableValue } from "./watchable";
import { produce } from "immer";

export class BasicStore<T>
  extends BasicWatchableValue<Immutable<T>>
  implements Store<T> {
  editValue(editor: Editor<Immutable<T>>) {
    const nextValue = (produce<Immutable<T>>(
      this.getValue(),
      editor
    ) as unknown) as Immutable<T>;
    return this.setValue(nextValue);
  }
}
