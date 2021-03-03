import {
  ActionPlan,
  ActionClass,
  Performer,
  ActionSequence,
  TERMINATE,
  Termination,
  isTermination,
} from "../types";

export const actor: Performer<never, any> = async function* () {
  let action = yield;
  while (true) {
    const reaction = await action.act();
    action = yield reaction;
  }
};

//TODO migrate to preferred performer signature without initial action argument like below
// export const actor: Performer<never, any> = async function* (): Performance<never, any> {
//   let action = yield;
//   while (true) {
//     const reaction = await action.act();
//     action = yield reaction;
//   }
// };

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

export async function performPlan<Ending, Reaction>(
  plan: ActionPlan<[], Ending, Reaction>
): Promise<Ending> {
  const ending = await directPlan(plan, actor);
  if (isTermination(ending)) {
    throw `Performer with Exit:never shouldn't terminate`;
  }
  return ending;
}

export async function performSequence<Ending, Reaction>(
  sequence: ActionSequence<Ending, Reaction>
): Promise<Ending> {
  const ending = await directSequence(sequence, actor);
  if (isTermination(ending)) {
    throw `Performer with Exit:never shouldn't terminate`;
  }
  return ending;
}

/** Launches a new ActionSequence from the ActionPlan, then hands over to directSequence. */
export async function directPlan<Ending, Reaction, Exit>(
  plan: ActionPlan<[], Ending, Reaction>,
  performer: Performer<never, Reaction>
): Promise<Ending | Termination> {
  let sequence = plan();
  return directSequence(sequence, performer);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (generates Actions, consumes Reactions)
 * * A Performer (generates Reactions, consumes Actions)
 * */
//TODO change argument order for consistency with 'performXXX' test library methods
export async function directSequence<Ending, Reaction, Exit>(
  sequence: ActionSequence<Ending, Reaction>,
  performer: Performer<Exit, Reaction>
): Promise<Ending | Termination> {
  let sequenceResult = sequence.next(); //prime the sequence
  if (sequenceResult.done) {
    return sequenceResult.value;
  }
  const performance = performer();
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
