import { Action, createActionScript, Procedure } from "@lauf/lauf-runner";
import { BasicMessageQueue, Selector, Store } from "@lauf/lauf-store";
import type { Editor, Immutable } from "@lauf/lauf-store/types/immutable";
import { receive } from "./queue";

export class EditValue<T> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly operator: Editor<Immutable<T>>
  ) {}
  act() {
    return this.store.editValue(this.operator);
  }
}

export const editValue = createActionScript(EditValue);

export function* followValue<In, Out>(
  store: Store<In>,
  selector: Selector<In, Out>,
  handler: Procedure<[Out], boolean>
) {
  const queue = new BasicMessageQueue<Out>();
  let prevSelected: Immutable<In> | void = undefined;
  const watcher = (value: Immutable<In>) => {
    const nextSelected = selector(value);
    if (!Object.is(nextSelected, prevSelected)) {
      prevSelected = value;
      queue.send(nextSelected);
    }
  };
  const unwatch = store.watch(watcher); //subscribe future events
  watcher(store.getValue()); //fire the initial state
  try {
    let outcome = false;
    do {
      const selected = yield* receive(queue);
      outcome = yield* handler(selected);
    } while (outcome !== true);
  } finally {
    unwatch();
  }
}
