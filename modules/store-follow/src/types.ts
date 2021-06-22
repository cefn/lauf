import { MessageQueue } from "@lauf/queue";

/** Function to process a queue of values including an initial starting value, leading to
 * a final `Ending` result.
 */
export type QueueHandler<Selected, Ending> = (
  valueQueue: MessageQueue<Selected>,
  initialValue: Selected
) => Promise<Ending>;

/** A function to notify a series of changing values from a store. */
export type Follower<Selected, Ending> = (
  selected: Selected,
  controlHandle: Controls<Selected, Ending>
) => Promise<void | ExitStatus>;

/** A control object for a [[Follow]] function to signal
 * exit behaviour, retrieve references.
 */
export type Controls<Selected, Ending> = {
  lastSelected: () => Selected | undefined;
  exit: (ending: Ending) => ExitStatus;
};

/** A type used as a special return value. */
export type ExitStatus = ["exit"];
