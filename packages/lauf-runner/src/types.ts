export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}

/** A Performance is a Generator with a next() that yields actions and
 * accepts their resolutions in return, until an Ending
 * is returned.
 */
export type Performance<Ending = void, Reaction = any> = Generator<
  Action<Reaction>,
  Ending,
  Reaction
>;

/** Script contains step-by-step instructions for a Performance. */
export type Script<
  Args extends any[] = any[],
  Ending = void,
  Reaction = any
> = (...args: Args) => Performance<Ending, Reaction>;

/** Utility interface for classes that implement Action */
export interface ActionClass<Params extends any[], Reaction> {
  new (...params: Params): Action<Reaction>;
}
