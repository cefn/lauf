import { castDraft, produce } from "immer";
import type { Selector, Store } from "../types";
import type { Editor, Immutable, RootState } from "../types/immutable";
import { DefaultStorePartition } from "./partition";
// import { BasicStorePartition } from "./partition";
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
 * array, tuple or object. This state will be updated and monitored for updates
 * to drive an app.
 * @param initialState - The initial [[RootState]] stored
 * @category
 */
export function createStore<State extends RootState>(
  initialState: Immutable<State>
): Store<State> {
  return new DefaultStore(initialState);
}

/** Create a partitioned [[Store]] wrapping a child property of another store's [[RootState]].
 *
 * Partitioning a store can ensure logical isolation within a store composed of
 * multiple distinct state trees.
 *
 * Partitioning helps to ensure efficiency of [[Watcher]] notifications for
 * certain application event topologies. Watchers of a partition are only
 * notified if a value has been changed within the partition, and hence its
 * [[RootState]] has changed.
 *
 * Also, partitions allow code relying on some [[RootState]] to be
 * agnostic whether it is the whole app state or just some part of it.
 */
export function createStorePartition<
  State extends RootState & { [k in Key]: RootState },
  Key extends keyof State
>(store: Store<State>, key: Key): Store<State[Key]> {
  return new DefaultStorePartition(store, key);
}
