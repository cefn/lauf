import { Sequence, RootProcedure, ActionClass } from "./types";

/** Streamline sequence creation from any Action class. */
export function createActionProcedure<Params extends any[], Reaction = any>(
  actionClass: ActionClass<Params, Reaction>
): (...actionParams: Params) => Sequence<Reaction> {
  return function* (...actionParams: Params) {
    const action = new actionClass(...actionParams);
    const result: Reaction = yield action;
    return result;
  };
}

/** Gets Actions from sequence, then awaits action#act()
 * and passes the Reaction back into next() until sequence is done.
 * Errors are passed to sequence.throw then thrown here.
 * @returns Outcome of sequence. */
export async function executeSequence<Outcome>(
  sequence: Sequence<Outcome>
): Promise<Outcome> {
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

//TODO make generic, passing through procedure parameters
export function beginProcedure<Outcome>(
  procedure: RootProcedure<Outcome>
): Sequence<Outcome> {
  return procedure();
}

export async function executeRootProcedure<Outcome>(
  procedure: RootProcedure<Outcome>
): Promise<Outcome> {
  const sequence = beginProcedure(procedure);
  return await executeSequence(sequence);
}
