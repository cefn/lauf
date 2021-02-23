import type { Action } from "@lauf/lauf-runner";

export type Performer<Reaction extends any = any> = () =>
  | AsyncGenerator<Reaction, never, Action<Reaction>>
  | Generator<Reaction, never, Action<Reaction>>;
