export const TERMINATE = ["terminate"] as const;
export type Termination = typeof TERMINATE;
export function isTermination(value: any): value is Termination {
  return value === TERMINATE;
}

/** Any function can be used */
export type AnyFn = (...args: any[]) => any;

/** This is the type returned by a function, (unrolling returned Promise for Async functions) */
export type Reaction<Fn extends AnyFn> = Fn extends () => Promise<
  infer Promised
>
  ? Promised
  : ReturnType<Fn>;

/** Represents an invocation of a function, without actually invoking it */
export type Invocation<Fn extends AnyFn> = [Fn, Parameters<Fn>];

/** An ActionSequence is a Generator with a next() that yields invocations and
 * accepts their reactions in return, until an Ending
 * is returned.
 */
export type ActionSequence<Ending, Fn extends AnyFn> = Generator<
  Invocation<Fn>,
  Ending,
  Reaction<Fn>
>;

/** ActionPlan contains step-by-step instructions for an ActionSequence. */
export type ActionPlan<Args extends any[], Ending, Fn extends AnyFn> = (
  ...args: Args
) => ActionSequence<Ending, Fn>;

export type ActionPerformer = <Fn extends AnyFn>(
  ...invocation: Invocation<Fn>
) => Promise<Reaction<Fn> | Termination>;
