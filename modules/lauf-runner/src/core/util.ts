import {
  ActionPlan,
  ActionSequence,
  ActionPerformer,
  ActionInvocation,
  isTermination,
  Termination,
} from "../types";

export const DEFAULT_PERFORMER: ActionPerformer = async <
  Reaction,
  ActionArgs extends any[]
>(
  ...[fn, args]: ActionInvocation<Reaction, ActionArgs>
) => {
  return fn(...args);
};

// Temporary? strategy to 'unroll' the actual returned type from Async functions
type Awaited<T> = T extends Promise<infer A> ? A : T;

export function planOfFunction<Reaction, ActionArgs extends any[]>(
  fn: (...args: ActionArgs) => Reaction
): ActionPlan<Awaited<Reaction>, ActionArgs, Awaited<Reaction>, ActionArgs> {
  return function* (
    ...parameters: ActionArgs
  ): ActionSequence<Awaited<Reaction>, Awaited<Reaction>, ActionArgs> {
    //TYPE ASSERTION! Promise-generating functions are implicitly unrolled by async Performer
    return yield [fn as (...args: ActionArgs) => Awaited<Reaction>, parameters];
  };
}

export async function performPlan<
  Ending,
  PlanArgs extends any[],
  Reaction,
  ActionArgs extends any[]
>(
  plan: ActionPlan<Ending, PlanArgs, Reaction, ActionArgs>,
  ...args: PlanArgs
): Promise<Ending | Termination> {
  return await directPlan(plan, args, DEFAULT_PERFORMER);
}

export async function performSequence<
  Ending,
  Reaction,
  ActionArgs extends any[]
>(
  sequence: ActionSequence<Ending, Reaction, ActionArgs>
): Promise<Ending | Termination> {
  return await directSequence(sequence, DEFAULT_PERFORMER);
}

/** Launches a new ActionSequence from the ActionPlan, then hands over to directSequence. */
export async function directPlan<
  Ending,
  PlanArgs extends any[],
  Reaction,
  ActionArgs extends any[]
>(
  plan: ActionPlan<Ending, PlanArgs, Reaction, ActionArgs>,
  args: PlanArgs,
  performer: ActionPerformer
): Promise<Ending | Termination> {
  let sequence = plan(...args);
  return directSequence(sequence, performer);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (generates Actions, consumes Reactions)
 * * A Performer (generates Reactions, consumes Actions)
 * */
export async function directSequence<
  Ending,
  Reaction,
  ActionArgs extends any[]
>(
  sequence: ActionSequence<Ending, Reaction, ActionArgs>,
  performer: ActionPerformer
): Promise<Ending | Termination> {
  let sequenceResult = sequence.next(); //prime the sequence
  while (true) {
    //sequence finished, return ending
    if (sequenceResult.done) {
      return sequenceResult.value;
    }
    //sequence continued, perform action
    const reaction = await performer(...sequenceResult.value);
    if (isTermination(reaction)) {
      return reaction;
    }
    //pass result of action, get next action or ending
    sequenceResult = sequence.next(reaction);
  }
}
