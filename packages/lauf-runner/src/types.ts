export const TERMINATE = ["terminate"] as const;
export type Termination = typeof TERMINATE;
export function isTermination(value: any): value is Termination {
  return value === TERMINATE;
}

export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}

/** Utility interface defining classes that implement Action */
export interface ActionClass<Params extends any[], Reaction> {
  new (...params: Params): Action<Reaction>;
}

/** An ActionSequence is a Generator with a next() that yields actions and
 * accepts their reactions in return, until an Ending
 * is returned.
 */
export type ActionSequence<Ending = void, Reaction = any> = Generator<
  Action<Reaction>,
  Ending,
  Reaction
>;

// export type ActionSequenceIteration<Ending, Reaction> = [
//   IteratorResult<Action<Reaction>, Ending>,
//   ActionSequence<Ending, Reaction>
// ];

/** ActionPlan contains step-by-step instructions for an ActionSequence. */
export type ActionPlan<
  Args extends any[] = any[],
  Ending = void,
  Reaction = any
> = (...args: Args) => ActionSequence<Ending, Reaction>;

//TODO add Sync routine as an option for testing?
export type Performance<Exit, Reaction> = AsyncGenerator<
  Reaction,
  Exit,
  Action<Reaction>
>;

export type Performer<Exit, Reaction> = (
  action: Action<Reaction>
) => Performance<Exit, Reaction>;
