import { ActionPlan } from "@lauf/lauf-runner";
import { Store } from "@lauf/lauf-store";
import { PlanHistory } from "./types";

function beginPlanHistory<State, Args extends any[], Ending, Reaction>(
  store: Store<State>,
  plan: ActionPlan<Args, Ending, Reaction>,
  args: Args
) {
  return {
    plan,
    args,
    initialState: store.read(),
    actionPhases: [],
    reactionPhases: [],
    forkHistories: {},
  };
}

class ForkTracker<State, Args extends any[], Ending, Reaction> {
  constructor(
    readonly store: Store<State>,
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args
  ) {
    this.planHistory = beginPlanHistory(store, plan, args);
  }
  protected planHistory: PlanHistory<State, Args, Ending, Reaction>;
  private nextPlanOrdinal: number = 0;
  private nextEventOrdinal: number = 0;
  getNextPlanOrdinal() {
    return this.nextPlanOrdinal++;
  }
  getNextEventOrdinal() {
    return this.nextEventOrdinal++;
  }

  async forkPlan(
    plan: ActionPlan<Args, Ending, Reaction>,
    ...args: Args
  ): Promise<Ending | Termination> {
    const planId = `${this.getNextPlanOrdinal()}_${plan.name}`;
    const planLog = new PlanHistorian(this, planHistory, plan, args);
    return await interceptPlan(plan, args, planLog);
  }
}
