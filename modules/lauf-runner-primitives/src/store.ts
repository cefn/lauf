import {
  Action,
  planOfAction,
  ActionPlan,
  ActionSequence,
} from "@lauf/lauf-runner";
import { Editor, Immutable, Selector, Store } from "@lauf/lauf-store";
import { BasicMessageQueue, MessageQueue } from "@lauf/lauf-queue";

import { receive } from "./queue";
import { ExitStatus, Follower, Controls } from "./types";

type QueueHandler<Selected, Ending> = ActionPlan<
  [MessageQueue<Selected>, Selected],
  Ending
>;

export function* withQueue<Value, Selected, Ending>(
  store: Store<Value>,
  selector: Selector<Value, Selected>,
  handleQueue: QueueHandler<Selected, Ending>
): ActionSequence<Ending> {
  const queue = new BasicMessageQueue<Selected>();
  let prevSelected: Selected = selector(store.read());
  const selectedNotifier = (value: Immutable<Value>) => {
    const nextSelected = selector(value);
    if (!Object.is(nextSelected, prevSelected)) {
      prevSelected = nextSelected;
      queue.send(nextSelected);
    }
  };
  const unwatch = store.watch(selectedNotifier); //subscribe future states
  selectedNotifier(store.read()); //notify the initial state
  try {
    return yield* handleQueue(queue, prevSelected);
  } finally {
    unwatch();
  }
}

export function* followSelected<Value, Selected, Ending>(
  store: Store<Value>,
  selector: Selector<Value, Selected>,
  follower: Follower<Selected, Ending>
): ActionSequence<Ending> {
  return yield* withQueue(store, selector, function* (queue, selected) {
    let result;
    let lastSelected: Selected | undefined;
    const exit: ExitStatus = ["exit"];
    const controls: Controls<Selected, Ending> = {
      exit(ending: Ending) {
        result = ending;
        return exit;
      },
      lastSelected() {
        return lastSelected;
      },
    };
    while (true) {
      const ending = yield* follower(selected, controls);
      if (ending === exit) {
        return (result as unknown) as Ending;
      }
      lastSelected = selected;
      selected = yield* receive<Selected>(queue);
    }
  });
}

export class Edit<T> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly operator: Editor<Immutable<T>>
  ) {}
  act() {
    return this.store.edit(this.operator);
  }
}
export const edit = planOfAction(Edit);

export class Select<T, V> implements Action<V> {
  constructor(readonly store: Store<T>, readonly selector: Selector<T, V>) {}
  act() {
    return this.store.select(this.selector);
  }
}
export const select = planOfAction(Select);

export class StorePlans<T> {
  constructor(readonly store: Store<T>) {}

  edit = (editor: Editor<T>) => edit(this.store, editor);

  select = <V>(selector: Selector<T, V>) => select(this.store, selector);

  followSelected = <V, E>(selector: Selector<T, V>, follower: Follower<V, E>) =>
    followSelected(this.store, selector, follower);

  withQueue = <V, E>(
    selector: Selector<T, V>,
    handleQueue: QueueHandler<V, E>
  ) => withQueue(this.store, selector, handleQueue);
}
