import type { ActionSequence, ActionPlan, ActionClass } from "../types";

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

//TODO make generic, passing through plan parameters
export function createActionSequence<Ending>(
  plan: ActionPlan<[], Ending>
): ActionSequence<Ending> {
  return plan();
}

/** Gets Actions from sequence, then awaits action#act()
 * and passes the Reaction back into next() until sequence is done.
 * Errors are passed to sequence.throw then thrown here.
 * @returns Ending of sequence. */
export async function performSequence<Ending>(
  sequence: ActionSequence<Ending>
): Promise<Ending> {
  try {
    //cannot accept value before first 'yield'
    let generated = sequence.next();
    while (!generated.done) {
      const reaction = await generated.value.act();
      generated = sequence.next(reaction);
    }
    return generated.value;
  } catch (error) {
    sequence.throw(error);
    throw error;
  }
}

export async function performPlan<Ending>(
  plan: ActionPlan<[], Ending>
): Promise<Ending> {
  const sequence = createActionSequence(plan);
  return await performSequence(sequence);
}
