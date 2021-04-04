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

type QueueHandler<Selected, Ending, Reaction> = ActionPlan<
  [MessageQueue<Selected>, Selected],
  Ending,
  Reaction
>;

export function* withQueue<Value, Selected, Ending, Reaction>(
  store: Store<Value>,
  selector: Selector<Value, Selected>,
  handleQueue: QueueHandler<Selected, Ending, any>
): ActionSequence<Ending, any> {
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

export function* follow<State, Selected, Ending, Reaction>(
  store: Store<State>,
  selector: Selector<State, Selected>,
  follower: Follower<Selected, Ending, Reaction>
): ActionSequence<Ending, Reaction | Selected> {
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

export class Edit<State> implements Action<Immutable<State>> {
  constructor(readonly store: Store<State>, readonly operator: Editor<State>) {}
  act() {
    return this.store.edit(this.operator);
  }
}
export const edit = planOfAction(Edit);

export class Select<State, Selected> implements Action<Immutable<Selected>> {
  constructor(
    readonly store: Store<State>,
    readonly selector: Selector<State, Selected>
  ) {}
  act() {
    return this.store.select(this.selector);
  }
}
export const select = planOfAction(Select);

export class StorePlans<State> {
  constructor(readonly store: Store<State>) {}

  edit = (editor: Editor<State>) => edit(this.store, editor);

  select = <Selected>(selector: Selector<State, Selected>) =>
    select(this.store, selector);

  follow = <Selected, Ending, Reaction>(
    selector: Selector<State, Selected>,
    follower: Follower<Selected, Ending, Reaction>
  ) => follow(this.store, selector, follower);

  withQueue = <Selected, Ending, Reaction>(
    selector: Selector<State, Selected>,
    handleQueue: QueueHandler<Selected, Ending, Reaction>
  ) => withQueue(this.store, selector, handleQueue);
}
