import type { ObjectParent, Partitioner, Selector, Store } from "../types";
import type { Editor, Immutable } from "../types/immutable";
import { BasicWatchable, BasicWatchableValue } from "./watchable";
import { castDraft, Draft, produce } from "immer";

export class BasicStore<State>
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
  partition: Partitioner<State> = <Key extends keyof State>(key: Key) =>
    new BasicStorePartition(this, key);
}

export class BasicStorePartition<
    State extends ObjectParent,
    Key extends keyof State
  >
  extends BasicWatchable<Immutable<State[Key]>>
  implements Store<State[Key]> {
  constructor(readonly store: Store<State>, readonly key: keyof State) {
    super();
    this.track();
  }
  private track = () => {
    let lastSubState: State[Key] | undefined;
    this.store.watch((state) => {
      const subState = state[this.key];
      if (Object.is(subState, lastSubState)) {
        return;
      }
      this.notify((subState as unknown) as Immutable<State[Key]>);
    });
  };
  read = () => {
    return (this.store.read()[this.key] as unknown) as Immutable<State[Key]>;
  };
  write = (state: Immutable<State[Key]>) => {
    this.store.edit((draft: Draft<Immutable<State>>) => {
      draft[this.key as keyof Draft<Immutable<State>>] = castDraft(state);
    });
    return this.read();
  };
  edit = (editor: Editor<State[Key]>) => {
    this.store.edit((draft: Draft<Immutable<State>>) => {
      const substate = draft[this.key as keyof Draft<Immutable<State>>];
      editor(substate as Draft<Immutable<State[Key]>>);
    });
    return this.read();
  };
  select = <Selected>(selector: Selector<State[Key], Selected>) => {
    return selector(this.read());
  };
  partition: Partitioner<State[Key]> = <SubKey extends keyof State[Key]>(
    subKey: SubKey
  ) => new BasicStorePartition(this, subKey);
}
