import type { Selector, Store } from "../types";
import type { Editor, Immutable } from "../types/immutable";
import { BasicWatchable, BasicWatchableValue } from "./watchable";
import { castDraft, Draft, produce } from "immer";

export class BasicStore<State extends object>
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
  partition = (key: keyof State) => new BasicStorePartition(this, key);
}

export class BasicStorePartition<
    State extends object,
    Key extends keyof State,
    SubState extends State[Key] & object
  >
  extends BasicWatchable<Immutable<SubState>>
  implements Store<SubState> {
  constructor(readonly store: Store<State>, readonly key: keyof State) {
    super();
    this.track();
  }
  private track() {
    let lastSubState: SubState | undefined;
    this.store.watch((state) => {
      const subState = state[this.key];
      if (Object.is(subState, lastSubState)) {
        return;
      }
      this.notify(subState as Immutable<SubState>);
    });
  }
  read = () => {
    return (this.store.read()[this.key] as unknown) as Immutable<SubState>;
  };
  write = (state: Immutable<State[Key]>) => {
    this.store.edit((draft: Draft<Immutable<State>>) => {
      draft[this.key as keyof Draft<Immutable<State>>] = castDraft(state);
    });
    return this.read();
  };
  edit = (editor: Editor<SubState>) => {
    this.store.edit((draft: Draft<Immutable<State>>) => {
      const substate = draft[this.key as keyof Draft<Immutable<State>>];
      editor(substate as Draft<Immutable<SubState>>);
    });
    return this.read();
  };
  select<Selected>(selector: Selector<SubState, Selected>) {
    return selector(this.read());
  }
  partition = (key: keyof SubState) => new BasicStorePartition(this, key);
}
