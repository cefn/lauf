import {
  directSequence,
  Action,
  ActionPlan,
  Performer,
  Termination,
} from "@lauf/lauf-runner";

export interface PlanInterceptor<Reaction> {
  interceptAction: <R extends Reaction>(action: Action<R>) => Action<R>;
  interceptReaction: <R extends Reaction>(reaction: R) => R;
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
