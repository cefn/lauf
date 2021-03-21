import { ActionPlan } from "@lauf/lauf-runner";

/** Special return 'flags' for followSelect */
const exitStatus = ["exit"] as const;
export type ExitStatus = typeof exitStatus;

export type Controls<Selected, Ending> = {
  lastSelected: () => Selected | undefined;
  exit: (ending: Ending) => ExitStatus;
};

export type Follower<T, V> = ActionPlan<[T, Controls<T, V>], void | ExitStatus>;
