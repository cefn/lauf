import { Procedure } from "@lauf/lauf-runner";

export const CONTINUE = ["continue"] as const;
export type Continuation = typeof CONTINUE;
export function isContinuation(value: any): value is Continuation {
  return value === CONTINUE;
}

/** Follower returns false to keep following, true to stop following. */
export type Follower<T, V> = Procedure<[T], V | Continuation>;
