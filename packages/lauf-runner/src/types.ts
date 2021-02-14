export interface ActionClass<Params extends any[], Reaction> {
  new (...params: Params): Action<Reaction>;
}

export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}

/** Generator with a next() that accepts the awaited result of
 * its own yielded actions until an outcome is returned.
 */
export type Sequence<Outcome = void, Reaction = any> = Generator<
  Action<Reaction>,
  Outcome,
  Reaction
>;

/** A configurable sequence factory, as invoked within a 'root' sequence */
export type Procedure<
  Args extends any[] = any[],
  Outcome = void,
  Reaction = any
> = (...args: Args) => Sequence<Outcome, Reaction>;

/**  A 'root' sequence factory (has no-arg signature)  */
export type RootProcedure<Outcome = void, Reaction = any> = Procedure<
  [],
  Outcome,
  Reaction
>;
