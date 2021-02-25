import type { Action, Performance } from "@lauf/lauf-runner";
import type { Performer } from "./types";

export async function perform<Ending, Reaction>(
  performance: Performance<Ending, Reaction>,
  performer: Performer<Reaction, any> = actor
): Promise<Ending> {
  const routine = performer(); //todo this should be called performance
  try {
    //prime both generators up to first 'yield'
    let actionResult = performance.next();
    let reactionResult = await routine.next();
    while (!actionResult.done) {
      reactionResult = await routine.next(actionResult.value);
      actionResult = performance.next(reactionResult.value);
    }
    return actionResult.value;
  } catch (error) {
    performance.throw(error);
    throw error;
  } finally {
    console.log("Hit finally");
  }
}

export async function* actor<Reaction>(): AsyncGenerator<
  Reaction,
  never,
  Action<Reaction>
> {
  let action;
  let reaction!: Reaction;
  while (true) {
    action = yield reaction;
    reaction = await action.act();
  }
}
