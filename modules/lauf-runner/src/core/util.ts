import {
  ActionPlan,
  ActionClass,
  Performer,
  ActionSequence,
  TERMINATE,
  Termination,
  isTermination,
  Performance,
} from "../types";

export const actor: Performer<never, any> = async function* () {
  let action = yield;
  while (true) {
    const reaction = await action.act();
    action = yield reaction;
  }
};

/** Streamline plan creation from any Action class. */
export function planOfAction<Params extends any[], Reaction = any>(
  actionClass: ActionClass<Params, Reaction>
): ActionPlan<Params, Reaction> {
  return function* (...actionParams: Params) {
    const action = new actionClass(...actionParams);
    const result: Reaction = yield action;
    return result;
  };
}

export async function performPlan<Args extends any[], Ending, Reaction>(
  plan: ActionPlan<Args, Ending, Reaction>,
  args: Args
): Promise<Ending> {
  const ending = await directPlan(plan, args);
  if (isTermination(ending)) {
    throw `Performer with Exit:never shouldn't terminate`;
  }
  return ending;
}

export async function performSequence<Ending, Reaction>(
  sequence: ActionSequence<Ending, Reaction>
): Promise<Ending> {
  const ending = await directSequence(sequence);
  if (isTermination(ending)) {
    throw `Performer with Exit:never shouldn't terminate`;
  }
  return ending;
}

/** Launches a new ActionSequence from the ActionPlan, then hands over to directSequence. */
export async function directPlan<Args extends any[], Ending, Reaction>(
  plan: ActionPlan<Args, Ending, Reaction>,
  args: Args,
  performance: Performance<any, Reaction> = actor()
): Promise<Ending | Termination> {
  let sequence = plan(...args);
  return directSequence(sequence, performance);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (generates Actions, consumes Reactions)
 * * A Performer (generates Reactions, consumes Actions)
 * */
//TODO change argument order for consistency with 'performXXX' test library methods
export async function directSequence<Ending, Reaction, Exit>(
  sequence: ActionSequence<Ending, Reaction>,
  performance: Performance<any, Reaction> = actor()
): Promise<Ending | Termination> {
  let sequenceResult = sequence.next(); //prime the sequence
  if (sequenceResult.done) {
    return sequenceResult.value;
  }
  let performanceResult = await performance.next(); //prime the performer
  if (performanceResult.done) {
    return TERMINATE;
  }
  while (true) {
    performanceResult = await performance.next(sequenceResult.value);
    if (performanceResult.done) {
      return TERMINATE;
    }
    sequenceResult = sequence.next(performanceResult.value);
    if (sequenceResult.done) {
      return sequenceResult.value;
    }
  }
}
