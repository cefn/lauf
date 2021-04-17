export const TERMINATE = ["terminate"] as const;
export type Termination = typeof TERMINATE;
export function isTermination(value: any): value is Termination {
  return value === TERMINATE;
}

export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}

/** Duck-typing of Action */
export function isAction(item: any): item is Action<any> {
  return typeof item.act === "function" && item.act.length === 0;
}

/** Utility interface defining classes that implement Action */
export interface ActionClass<Params extends any[], Reaction> {
  new (...params: Params): Action<Reaction>;
}

/** An ActionSequence is a Generator with a next() that yields actions and
 * accepts their reactions in return, until an Ending
 * is returned.
 */
export type ActionSequence<Ending, Reaction> = Generator<
  Action<Reaction>,
  Ending,
  Reaction
>;

/** ActionPlan contains step-by-step instructions for an ActionSequence. */
export type ActionPlan<Args extends any[], Ending, Reaction> = (
  ...args: Args
) => ActionSequence<Ending, Reaction>;

export type ActionPerformer = <Reaction>(
  action: Action<Reaction>
) => Reaction | Promise<Reaction>;
