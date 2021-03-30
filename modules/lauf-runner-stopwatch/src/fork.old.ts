import { Action, ActionPlan, Termination } from "@lauf/lauf-runner";
import { Immutable, Store } from "@lauf/lauf-store";
import { interceptPlan, PlanInterceptor } from "./intercept";

class ActionPhase<State, Reaction> {
  constructor(
    readonly action: Action<Reaction>,
    readonly prevState: Immutable<State>,
    readonly eventOrdinal: number,
    readonly timestamp: number
  ) {}
}

class ReactionPhase<State, Reaction> {
  constructor(
    readonly reaction: Reaction,
    readonly prevState: Immutable<State>,
    readonly eventOrdinal: number,
    readonly timestamp: number
  ) {}
}

class PlanLog<State, Args extends any[], Ending, Reaction>
  implements PlanInterceptor<Reaction> {
  constructor(
    readonly tracker: ForkTracker<State, any, any, any>,
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args
  ) {}
  actionPhases: ReadonlyArray<ActionPhase<State, Reaction>> = [];
  reactionPhases: ReadonlyArray<ReactionPhase<State, Reaction>> = [];
  ending: Ending | undefined;
  interceptAction<R extends Reaction>(action: Action<R>) {
    const prevState = this.tracker.store.read();
    this.actionPhases = [
      ...this.actionPhases,
      new ActionPhase(
        action,
        prevState,
        this.tracker.getNextEventOrdinal(),
        new Date().getTime()
      ),
    ];
    return action;
  }
  interceptReaction<R extends Reaction>(reaction: R) {
    const prevState = this.tracker.store.read();
    this.reactionPhases = [
      ...this.reactionPhases,
      new ReactionPhase(
        reaction,
        prevState,
        this.tracker.getNextEventOrdinal(),
        new Date().getTime()
      ),
    ];
    return reaction;
  }
}

class ForkTracker<State, Args extends any[], Ending, Reaction> {
  constructor(
    readonly store: Store<State>,
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args
  ) {}
  private nextPlanOrdinal: number = 0;
  private nextEventOrdinal: number = 0;
  protected planLogs: {
    [key: string]: PlanLog<State, any, any, any>;
  } = {};
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
    const planLog = new PlanLog(this, plan, args);
    this.planLogs[planId] = planLog;
    return await interceptPlan(plan, args, planLog);
  }
}
