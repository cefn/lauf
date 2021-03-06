import { ActionPlan } from "@lauf/lauf-runner";

/** Special return 'flags' for followSelect */
const exitStatus = ["exit"] as const;
export type ExitStatus = typeof exitStatus;

export type Controls<Selected, Ending> = {
  lastSelected: () => Selected | undefined;
  exit: (ending: Ending) => ExitStatus;
};

export type Follower<Selected, Ending, Reaction> = ActionPlan<
  [Selected, Controls<Selected, Ending>],
  void | ExitStatus,
  Reaction
>;
