import { castDraft, Draft } from "immer";
import {
  Editor,
  Immutable,
  PartitionableState,
  Selector,
  Store,
} from "../types";
import { DefaultWatchable } from "./watchable";

/** Utility class for partitioning of a Store. See [[createStorePartition]]. */
class DefaultStorePartition<
    ParentState extends PartitionableState<Key>,
    Key extends keyof ParentState
  >
  extends DefaultWatchable<Immutable<ParentState[Key]>>
  implements Store<ParentState[Key]> {
  constructor(
    readonly store: Store<ParentState>,
    readonly key: keyof ParentState
  ) {
    super();
    this.track();
  }

  private readonly track = () => {
    let lastSubState: ParentState[Key] | undefined;
    this.store.watch((state) => {
      const subState = state[this.key];
      if (Object.is(subState, lastSubState)) {
        return;
      }
      void this.notify(subState as Immutable<ParentState[Key]>);
    });
  };

  read = () => {
    return this.store.read()[this.key] as Immutable<ParentState[Key]>;
  };

  write = (state: Immutable<ParentState[Key]>) => {
    this.store.edit((draft: Draft<Immutable<ParentState>>) => {
      draft[this.key as keyof Draft<Immutable<ParentState>>] = castDraft(state);
    });
    return this.read();
  };

  edit = (editor: Editor<ParentState[Key]>) => {
    this.store.edit(
      (draft: Draft<Immutable<ParentState>>, toDraft: typeof castDraft) => {
        const substate = draft[this.key as keyof Draft<Immutable<ParentState>>];
        editor(substate as Draft<Immutable<ParentState[Key]>>, toDraft);
      }
    );
    return this.read();
  };

  select = <Selected>(selector: Selector<ParentState[Key], Selected>) => {
    return selector(this.read());
  };
}

/** Provides a [[Store]] by tracking a child property of another store's
 * [[RootState]]. See [[PartitionableState]] for more details.
 *
 */
export function createStorePartition<
  State extends PartitionableState<Key>,
  Key extends keyof State
>(store: Store<State>, key: Key): Store<State[Key]> {
  return new DefaultStorePartition(store, key);
}
