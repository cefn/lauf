export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}

export interface ActionClass<Params extends any[], Reaction> {
  new (...params: Params): Action<Reaction>;
}

/** Generator with a next() that accepts the awaited result of
 * its own yielded actions until an Ending is returned.
 */
export type Performance<Ending = void, Reaction = any> = Generator<
  Action<Reaction>,
  Ending,
  Reaction
>;

/** A Script is step-by-step instructions for a performance. */
export type Script<
  Args extends any[] = any[],
  Ending = void,
  Reaction = any
> = (...args: Args) => Performance<Ending, Reaction>;
