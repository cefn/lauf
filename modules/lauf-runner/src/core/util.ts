import {
  ActionPlan,
  ActionClass,
  Performer,
  ActionSequence,
  Action,
} from "../types";

export const ACTOR: Performer = async <Reaction>(action: Action<Reaction>) =>
  await action.act();

export class Call<Args extends any[], Reaction> implements Action<Reaction> {
  args: Args;
  constructor(
    readonly fn: (...args: Args) => Reaction | Promise<Reaction>,
    ...args: Args
  ) {
    this.args = args;
  }
  act() {
    return this.fn(...this.args);
  }
}

export const call = planOfAction(Call);

/** Streamline plan creation from any Action class. */
export function planOfAction<Args extends any[], Ending>(
  actionClass: ActionClass<Args, Ending>
): ActionPlan<Args, Ending, Ending> {
  const planName = `plan${actionClass.name}`;
  const nameWrapper = {
    [planName]: function* (...actionParams: Args) {
      const action = new actionClass(...actionParams);
      const result: Ending = yield action;
      return result;
    },
  } as const;
  return nameWrapper[planName]!;
}

export function planOfFunction<Args extends any[], Reaction>(
  fn: (...args: Args) => Reaction
) {
  return function* (...args: Args) {
    yield* call(fn, ...args);
  };
}

export function performPlan<Args extends any[], Ending, Reaction>(
  plan: ActionPlan<Args, Ending, Reaction>,
  ...args: Args
): Promise<Ending> {
  return directPlan(plan, args, ACTOR);
}

export function performSequence<Ending, Reaction>(
  sequence: ActionSequence<Ending, Reaction>
): Promise<Ending> {
  return directSequence(sequence, ACTOR);
}

/** Launches a new ActionSequence from the ActionPlan, then hands over to directSequence. */
export async function directPlan<Args extends any[], Ending, Reaction>(
  plan: ActionPlan<Args, Ending, Reaction>,
  args: Args,
  performer: Performer
): Promise<Ending> {
  let sequence = plan(...args);
  return directSequence(sequence, performer);
}

/** Hands Actions and Reactions between two co-routines.
 * * An ActionSequence (generates Actions, consumes Reactions)
 * * A Performer (generates Reactions, consumes Actions)
 * */
//TODO change argument order for consistency with 'performXXX' test library methods
export async function directSequence<Ending, Reaction, Exit>(
  sequence: ActionSequence<Ending, Reaction>,
  performer: Performer
): Promise<Ending> {
  let sequenceResult = sequence.next(); //prime the sequence
  while (true) {
    //sequence finished, return ending
    if (sequenceResult.done) {
      return sequenceResult.value;
    }
    //sequence continued, perform action
    const reaction = await performer(sequenceResult.value);
    //pass result of action, get next action or ending
    sequenceResult = sequence.next(reaction);
  }
}
