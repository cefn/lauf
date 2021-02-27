import {
  Action,
  createActionPlan,
  ActionPlan,
  ActionSequence,
} from "@lauf/lauf-runner";
import { Selector, Store } from "@lauf/lauf-store";
import { BasicMessageQueue, MessageQueue } from "@lauf/lauf-queue";

import type { Editor, Immutable } from "@lauf/lauf-store/types/immutable";
import { receive } from "./queue";
import { Continuation, Follower, isContinuation } from "./types";

export class EditValue<T> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly operator: Editor<Immutable<T>>
  ) {}
  act() {
    return this.store.editValue(this.operator);
  }
}

export const editValue = createActionPlan(EditValue);

export function* withSelectorQueue<Value, Selected, Ending>(
  store: Store<Value>,
  selector: Selector<Value, Selected>,
  handleQueue: ActionPlan<[MessageQueue<Selected>], Ending>
): ActionSequence<Ending> {
  const queue = new BasicMessageQueue<Selected>();
  let prevSelected: Immutable<Value> | void = undefined;
  const selectedNotifier = (value: Immutable<Value>) => {
    const nextSelected = selector(value);
    if (!Object.is(nextSelected, prevSelected)) {
      prevSelected = value;
      queue.send(nextSelected);
    }
  };
  const unwatch = store.watch(selectedNotifier); //subscribe future states
  selectedNotifier(store.getValue()); //notify the initial state
  try {
    return yield* handleQueue(queue);
  } finally {
    unwatch();
  }
}

/** TODO change pattern to return a queue (receive from multiple queues within a scope) */
/** TODO change return to use a singleton value for continuation, (alongside arbitrary ending type). */
export function* followStoreSelector<Value, Selected, Ending>(
  store: Store<Value>,
  selector: Selector<Value, Selected>,
  follower: Follower<Selected, Ending>
): ActionSequence<Ending> {
  return yield* withSelectorQueue(store, selector, function* (queue) {
    let ending;
    do {
      const selected = yield* receive<Selected>(queue);
      ending = yield* follower(selected);
    } while (isContinuation(ending));
    return ending;
  });
}
