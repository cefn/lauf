import {
  ActionPlan,
  ActionSequence,
  ActionPerformer,
  AnyFn,
  Invocation,
  isTermination,
  Termination,
  Reaction,
} from "../types";

export const DEFAULT_PERFORMER: ActionPerformer = async <Fn extends AnyFn>(
  ...invocation: Invocation<Fn>
) => {
  const [fn, args]: [Fn, Parameters<Fn>] = invocation;
  return await fn(...args);
};

export function planOfFunction<Fn extends AnyFn>(
  fn: Fn
): ActionPlan<Parameters<Fn>, Reaction<Fn>, Fn> {
  return function* (
    ...parameters: Parameters<Fn>
  ): ActionSequence<Reaction<Fn>, Fn> {
    return yield [fn, parameters];
  };
}

export async function performPlan<Args extends any[], Ending, Fn extends AnyFn>(
  plan: ActionPlan<Args, Ending, Fn>,
  ...args: Args
): Promise<Ending | Termination> {
  return await directPlan(plan, args, DEFAULT_PERFORMER);
}

export async function performSequence<Ending, Fn extends AnyFn>(
  sequence: ActionSequence<Ending, Fn>
): Promise<Ending | Termination> {
  return await directSequence(sequence, DEFAULT_PERFORMER);
}

/** Launches a new ActionSequence from the ActionPlan, then hands over to directSequence. */
export async function directPlan<Args extends any[], Ending, Fn extends AnyFn>(
  plan: ActionPlan<Args, Ending, Fn>,
  args: Args,
  performer: ActionPerformer
): Promise<Ending | Termination> {
  let sequence = plan(...args);
  return directSequence(sequence, performer);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (generates Actions, consumes Reactions)
 * * A Performer (generates Reactions, consumes Actions)
 * */
//TODO change argument order for consistency with 'performXXX' test library methods
export async function directSequence<Ending, Fn extends AnyFn, Exit>(
  sequence: ActionSequence<Ending, Fn>,
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
