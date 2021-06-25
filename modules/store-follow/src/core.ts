import { createQueue } from "@lauf/queue";
import { Immutable, RootState, Selector, Store } from "@lauf/store";
import { Controls, Follower, QueueHandler, ExitStatus } from "./types";

/**
 * Creates a queue subscribed to a [[Store]]'s [[Selector]] value then waits for
 * `handleQueue` to complete (which may be async). A selector queue
 * [Queue.receive|receives] an initial message with the value calculated by the
 * [[Selector|selector]] from the [[Store|store]]. It is subscribed to receive a
 * further message whenever the selector's value changes. After `handleQueue`
 * returns the queue is unsubscribed.
 * @param store The store to monitor
 * @param selector The function to extract the selected value
 * @param handleQueue Callback which will be passed the queue
 * @returns
 */
export async function withSelectorQueue<
  State extends RootState,
  Selected,
  Ending
>(
  store: Store<State>,
  selector: Selector<State, Selected>,
  handleQueue: QueueHandler<Selected, Ending>
): Promise<Ending> {
  const queue = createQueue<Selected>();
  //Could be hoisted as a 'SelectorWatchable'
  let prevSelected: Selected = selector(store.read());
  const selectedNotifier = (value: Immutable<State>) => {
    const nextSelected = selector(value);
    if (!Object.is(nextSelected, prevSelected)) {
      prevSelected = nextSelected;
      queue.send(nextSelected);
    }
  };
  const unwatch = store.watch(selectedNotifier); // subscribe future states
  selectedNotifier(store.read()); // notify the initial state
  try {
    return await handleQueue(queue, prevSelected);
  } finally {
    unwatch();
  }
}

/**
 * Calls back and waits on the [[Follower|follower]] one time with the initial
 * value of [[Selector]] then again every time the Store has a changed value of
 * [[Selector]]. The [[Follower|follower]] is passed the new value, and also a
 * [[Control|control]] object.
 * @param store The store to follow
 * @param selector The function to extract the selected value
 * @param follower The callback to handle each changing value
 * @returns An `Ending` returned when exiting the loop
 */
export async function followSelector<State extends RootState, Selected, Ending>(
  store: Store<State>,
  selector: Selector<State, Selected>,
  follower: Follower<Selected, Ending>
): Promise<Ending> {
  return await withSelectorQueue(
    store,
    selector,
    async function (queue, selected) {
      const { receive } = queue;
      let result: Ending;
      let lastSelected: Selected | undefined;
      const exitStatus: ExitStatus = ["exit"];
      const controls: Controls<Selected, Ending> = {
        exit(ending: Ending) {
          result = ending;
          return exitStatus;
        },
        lastSelected() {
          return lastSelected;
        },
      };
      while (true) {
        const ending = await follower(selected, controls);
        if (ending === exitStatus) {
          return result!;
        }
        lastSelected = selected;
        selected = await receive();
      }
    }
  );
}
