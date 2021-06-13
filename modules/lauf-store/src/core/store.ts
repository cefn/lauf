import { castDraft, produce } from "immer";
import type { RootState, Selector, Store, Watcher } from "../types";
import type { Editor, Immutable } from "../types/immutable";
import { DefaultWatchableState } from "./watchableState";

/** Reference implementation of Lauf [[Store]]  */
class DefaultStore<State extends RootState>
  extends DefaultWatchableState<Immutable<State>>
  implements Store<State> {
  edit = (editor: Editor<State>) => {
    const nextState = (produce<Immutable<State>>(this.read(), (draft) =>
      editor(draft, castDraft)
    ) as unknown) as Immutable<State>;
    return this.write(nextState);
  };

  select = <Selected>(selector: Selector<State, Selected>) => {
    return selector(this.read());
  };
}

/** Initialise a [[Store]] with an [[Immutable]] initial [[RootState]] - any
 * array, tuple or object. This state can be updated and monitored for updates
 * to drive an app.
 * @param initialState - The initial [[RootState]] stored
 * @category
 */
export function createStore<State extends RootState>(
  initialState: Immutable<State>,
  watchers?: ReadonlyArray<Watcher<State>>
): Store<State> {
  return new DefaultStore(initialState, watchers);
}
