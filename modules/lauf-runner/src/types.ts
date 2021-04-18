export const TERMINATE = ["terminate"] as const;
export type Termination = typeof TERMINATE;
export function isTermination(value: any): value is Termination {
  return value === TERMINATE;
}

/** Represents an invocation of a function, without actually invoking it */
export type ActionInvocation<Reaction, ActionArgs extends any[]> = [
  (...args: ActionArgs) => Reaction,
  ActionArgs
];

// export type Awaited<T> = T extends Promise<infer A> ? A : T;

/** An ActionSequence is a Generator with a next() that yields invocations and
 * accepts their reactions in return, until an Ending
 * is returned.
 */
export type ActionSequence<
  Ending,
  Reaction,
  ActionArgs extends any[]
> = Generator<ActionInvocation<Reaction, ActionArgs>, Ending, Reaction>;

/** ActionPlan contains step-by-step instructions for an ActionSequence. */
export type ActionPlan<
  PlanEnding,
  PlanArgs extends any[],
  Reaction,
  ActionArgs extends any[]
> = (...args: PlanArgs) => ActionSequence<PlanEnding, Reaction, ActionArgs>;

export type ActionPerformer = <Reaction, ActionArgs extends any[]>(
  ...invocation: ActionInvocation<Reaction, ActionArgs>
) => Promise<Reaction | Termination>;
