import type { Action } from "@lauf/lauf-runner";

export type SyncPerformance<Reaction, Return> = Generator<
  Reaction,
  Return,
  Action<Reaction>
>;

export type AsyncPerformance<Reaction, Return> = AsyncGenerator<
  Reaction,
  Return,
  Action<Reaction>
>;

//TODO add Sync routine as an option for testing?
export type Performance<Reaction, Return> = AsyncPerformance<Reaction, Return>;
// | SyncRoutine<Reaction, Return>;

export type Performer<Reaction, Return = never> = (
  action: Action<Reaction>
) => Performance<Reaction, Return>;
