import { castDraft, Draft } from "immer";
import { Editor, Immutable, RootState, Selector, Store } from "../types";
import { BasicWatchable } from "./watchable";

export class BasicStorePartition<
    State extends RootState,
    Key extends keyof State,
    SubState extends State[Key] & RootState
  >
  extends BasicWatchable<Immutable<SubState>>
  implements Store<SubState> {
  constructor(readonly store: Store<State>, readonly key: keyof State) {
    super();
    this.track();
  }

  private readonly track = () => {
    let lastSubState: SubState | undefined;
    this.store.watch((state) => {
      const subState = state[this.key];
      if (Object.is(subState, lastSubState)) {
        return;
      }
      void this.notify(subState as Immutable<SubState>);
    });
  };

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

  select = <Selected>(selector: Selector<SubState, Selected>) => {
    return selector(this.read());
  };

  partition = (key: keyof SubState) => new BasicStorePartition(this, key);
}
