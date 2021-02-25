import type { Action } from "@lauf/lauf-runner";

export type SyncRoutine<Reaction, Return> = Generator<
  Reaction,
  Return,
  Action<Reaction>
>;

export type AsyncRoutine<Reaction, Return> = AsyncGenerator<
  Reaction,
  Return,
  Action<Reaction>
>;

//TODO should be performance, add Sync routine as an option for testing?
export type Routine<Reaction, Return> = AsyncRoutine<Reaction, Return>;
// | SyncRoutine<Reaction, Return>;

export type Performer<Reaction, Return = never> = () => Routine<
  Reaction,
  Return
>;
