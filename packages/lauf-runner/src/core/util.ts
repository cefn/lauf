import {
  Action,
  ActionPlan,
  ActionClass,
  Performer,
  Performance,
  ActionSequence,
  TERMINATE,
  isTermination,
} from "../types";

export const actor: Performer<never, any> = async function* (
  action: Action<any>
): Performance<never, any> {
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

//TODO retire params here which is probably never used.
//will help with directPlan signature having consistent 'performer-last' semantics
export async function performPlan<Params extends any[], Ending, Reaction>(
  plan: ActionPlan<Params, Ending, Reaction>,
  ...params: Params
): Promise<Ending> {
  const ending = await directPlan(actor, plan, ...params);
  if (isTermination(ending)) {
    throw `Performance of actor should never terminate`;
  }
  return ending;
}

export async function performSequence<Ending, Reaction>(
  sequence: ActionSequence<Ending, Reaction>
): Promise<Ending> {
  const ending = await directSequence(actor, sequence);
  if (isTermination(ending)) {
    throw `Performance of actor should never terminate`;
  }
  return ending;
}

/** Launches a new ActionSequence from the ActionPlan, then hands over to directSequence. */
export async function directPlan<Params extends any[], Ending, Reaction, Exit>(
  performer: Performer<Exit, Reaction>,
  plan: ActionPlan<Params, Ending, Reaction>,
  ...params: Params
) {
  let sequence = plan(...params);
  return directSequence(performer, sequence);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (generates Actions, consumes Reactions)
 * * A Performer (generates Reactions, consumes Actions)
 * */
//TODO change argument order for consistency with 'performXXX' test library methods
export async function directSequence<Ending, Reaction, Exit>(
  performer: Performer<Exit, Reaction>,
  sequence: ActionSequence<Ending, Reaction>
) {
  let sequenceResult = sequence.next(); //prime the sequence
  if (sequenceResult.done) {
    return sequenceResult.value;
  }
  const performance = performer(sequenceResult.value);
  let performanceResult = await performance.next(); //prime the performer
  if (performanceResult.done) {
    return TERMINATE;
  }
  while (true) {
    sequenceResult = sequence.next(performanceResult.value);
    if (sequenceResult.done) {
      return sequenceResult.value;
    }
    performanceResult = await performance.next(sequenceResult.value);
    if (performanceResult.done) {
      return TERMINATE;
    }
  }
}
