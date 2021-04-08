import {
  directSequence,
  Action,
  ActionPlan,
  Performer,
  Termination,
} from "@lauf/lauf-runner";
import { Immutable } from "@lauf/lauf-store/src";

export interface PlanInterceptor<Reaction> {
  interceptAction: (action: Action<Reaction>) => Action<Reaction>;
  interceptReaction: (reaction: Reaction) => Reaction;
}

export async function interceptPlan<Args extends any[], Ending, Reaction>(
  plan: ActionPlan<Args, Ending, Reaction>,
  args: Args,
  interceptor: PlanInterceptor<Reaction>
): Promise<Ending | Termination> {
  const interceptingActor: Performer<never, any> = async function* () {
    let action = yield;
    while (true) {
      action = interceptor.interceptAction(action);
      let reaction = await action.act();
      reaction = interceptor.interceptReaction(reaction);
      action = yield reaction;
    }
  };
  return await directSequence(plan(...args), interceptingActor());
}
