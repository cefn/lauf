import {
  Action,
  ActionPlan,
  ActionClass,
  Performer,
  ActionSequence,
} from "../types";

export const actor: Performer<any, never> = async function* (
  action: Action<any>
) {
  while (true) {
    const reaction = await action.act();
    action = yield reaction;
  }
};

/** Streamline plan creation from any Action class. */
export function createActionPlan<Params extends any[], Reaction = any>(
  actionClass: ActionClass<Params, Reaction>
): ActionPlan<Params, Reaction> {
  return function* (...actionParams: Params) {
    const action = new actionClass(...actionParams);
    const result: Reaction = yield action;
    return result;
  };
}

export async function performPlan<Params extends any[], Ending, Reaction>(
  plan: ActionPlan<Params, Ending, Reaction>,
  ...params: Params
): Promise<Ending> {
  return directPlan(actor, plan, ...params);
}

export async function performSequence<Ending, Reaction>(
  sequence: ActionSequence<Ending, Reaction>
): Promise<Ending> {
  return directSequence(actor, sequence);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (which generates the actions, consumes the reactions)
 * * A Performer (which generates the reactions, consumes the actions)
 * */
export async function directPlan<Params extends any[], Ending, Reaction>(
  performer: Performer<Reaction, any>,
  plan: ActionPlan<Params, Ending, Reaction>,
  ...params: Params
): Promise<Ending> {
  let sequence = plan(...params);
  return directSequence(performer, sequence);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (which generates the actions, consumes the reactions)
 * * A Performer (which generates the reactions, consumes the actions)
 * */
export async function directSequence<Ending, Reaction>(
  performer: Performer<Reaction, any>,
  sequence: ActionSequence<Ending, Reaction>
): Promise<Ending> {
  let sequenceResult = sequence.next();
  if (!sequenceResult.done) {
    const performance = performer(sequenceResult.value);
    do {
      const performanceResult = await performance.next(sequenceResult.value);
      sequenceResult = sequence.next(performanceResult.value);
    } while (!sequenceResult.done);
  }
  return sequenceResult.value;
}
