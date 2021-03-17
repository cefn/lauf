import { ActionPlan } from "@lauf/lauf-runner";

/** Special return 'flags' for followSelect */
const exitStatus = ["exit"] as const;
export type ExitStatus = typeof exitStatus;
export type ExitNotifier<V> = (value: V) => ExitStatus;
export type Notifiers<V> = {
  exit: ExitNotifier<V>;
};

export type Follower<T, V> = ActionPlan<[T, Notifiers<V>], void | ExitStatus>;
