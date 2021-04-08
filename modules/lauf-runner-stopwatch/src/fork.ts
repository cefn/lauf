import { Action, ActionPlan, Termination } from "@lauf/lauf-runner/src";
import { Store } from "@lauf/lauf-store/src";
import { interceptPlan, PlanInterceptor } from "./intercept";
import { ForkId, ActionPhase, ReactionPhase } from "./types";

class ForkRegistry<State> {
  private nextForkId = 0;
  private nextEventId = 0;
  constructor(readonly store: Store<State>) {}

  forkHandles: Record<ForkId, ForkHandle<State, any, any, any>> = {};

  assignForkId() {
    return this.nextForkId++;
  }

  assignEventId() {
    return this.nextEventId++;
  }

  async watchPlan<Args extends any[], Ending, Reaction>(
    plan: ActionPlan<Args, Ending, Reaction>,
    args: Args,
    parentId: null
  ): Promise<Ending | Termination> {
    const idPrefix = parentId ? `${parentId}:` : "";
    const idSuffix = `${this.assignForkId()}-${plan.name}`;
    const id = idPrefix + idSuffix;
    const forkHandle = new ForkHandle(this, plan, args, id, parentId);
    return await interceptPlan(plan, args, forkHandle);
  }
}

class ForkHandle<State, Args extends any[], Ending, Reaction>
  implements PlanInterceptor<Reaction> {
  private actionPhases: ReadonlyArray<ActionPhase<State, Reaction>> = [];
  private reactionPhases: ReadonlyArray<ReactionPhase<State, Reaction>> = [];

  constructor(
    readonly registry: ForkRegistry<State>,
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args,
    readonly id: ForkId,
    readonly parentId: ForkId | null
  ) {}

  interceptAction(action: Action<Reaction>): Action<Reaction> {
    this.actionPhases = [
      ...this.actionPhases,
      {
        action,
        prevState: this.registry.store.read(),
        eventId: this.registry.assignEventId(),
        timestamp: new Date().getTime(),
      },
    ];
    return action;
  }

  interceptReaction(reaction: Reaction): Reaction {
    const reactionPhase: ReactionPhase<State, Reaction> = {
      reaction,
      prevState: this.registry.store.read(),
      eventId: this.registry.assignEventId(),
      timestamp: new Date().getTime(),
    };
    this.reactionPhases = [...this.reactionPhases, reactionPhase];
    return reaction;
  }
}
