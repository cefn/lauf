import { produce } from "immer";
import type { Selector, Store } from "../types";
import type { Editor, Immutable, RootState } from "../types/immutable";
import { BasicStorePartition } from "./partition";
import { BasicWatchableValue } from "./watchableValue";

export { castDraft } from "immer";

export class BasicStore<State extends RootState>
  extends BasicWatchableValue<Immutable<State>>
  implements Store<State> {
  edit = (editor: Editor<State>) => {
    const nextState = (produce<Immutable<State>>(
      this.read(),
      editor
    ) as unknown) as Immutable<State>;
    return this.write(nextState);
  };

  select = <Selected>(selector: Selector<State, Selected>) => {
    return selector(this.read());
  };

  partition = (key: keyof State) => new BasicStorePartition(this, key);
}
