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

/** ActionPlan contains step-by-step instructions for an ActionSequence. */
export type ActionPlan<
  Args extends any[] = any[],
  Ending = void,
  Reaction = any
> = (...args: Args) => ActionSequence<Ending, Reaction>;
