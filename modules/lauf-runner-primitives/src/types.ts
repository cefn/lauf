import { ActionPlan } from "@lauf/lauf-runner";

export const CONTINUE = ["continue"] as const;
export type Continuation = typeof CONTINUE;
export function isContinuation(value: any): value is Continuation {
  return value === CONTINUE;
}

export type Follower<T, V> = ActionPlan<[T], V | Continuation>;
