import {
  Action,
  planOfAction,
  ActionPlan,
  ActionSequence,
} from "@lauf/lauf-runner";
import { Editor, Immutable, Selector, Store } from "@lauf/lauf-store";
import { BasicMessageQueue, MessageQueue } from "@lauf/lauf-queue";

import { receive } from "./queue";
import { Follower, isContinuation } from "./types";

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

export function* withChangeQueue<Value, Selected, Ending>(
  store: Store<Value>,
  selector: Selector<Value, Selected>,
  handleQueue: ActionPlan<[MessageQueue<Selected>, Selected], Ending>
): ActionSequence<Ending> {
  const queue = new BasicMessageQueue<Selected>();
  let prevSelected: Selected = selector(store.getValue());
  const selectedNotifier = (value: Immutable<Value>) => {
    const nextSelected = selector(value);
    if (!Object.is(nextSelected, prevSelected)) {
      prevSelected = nextSelected;
      queue.send(nextSelected);
    }
  };
  const unwatch = store.watch(selectedNotifier); //subscribe future states
  selectedNotifier(store.getValue()); //notify the initial state
  try {
    return yield* handleQueue(queue, prevSelected);
  } finally {
    unwatch();
  }
}

/** TODO change pattern to return a queue (receive from multiple queues within a scope) */
/** TODO change return to use a singleton value for continuation, (allowing escape of loop). */
/** TODO eliminate CONTINUATION return. Introduce command singleton factory after selected
 * argument of callback - e.g. function* (selected, {exit} { return exit(4); }
 * Would only allow commands as Follower return value. Only terminate loop when singleton returned. */
export function* followStoreSelector<Value, Selected, Ending>(
  store: Store<Value>,
  selector: Selector<Value, Selected>,
  follower: Follower<Selected, Ending>
): ActionSequence<Ending> {
  return yield* withChangeQueue(store, selector, function* (queue, selected) {
    let ending;
    while (true) {
      ending = yield* follower(selected);
      if (!isContinuation(ending)) {
        return ending;
      }
      selected = yield* receive<Selected>(queue);
    }
  });
}
