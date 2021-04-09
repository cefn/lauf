import { Action, ActionPlan, Termination } from "@lauf/lauf-runner/src";
import { Store } from "@lauf/lauf-store/src";
import { interceptPlan, PlanInterceptor } from "./intercept";
import { Id, ActionPhase, ReactionPhase } from "./types";

export class ForkRegistry<State> {
  private nextForkOrdinal = 0;
  private nextEventOrdinal = 0;
  constructor(readonly store: Store<State>) {}

  forkHandles: Record<Id, ForkHandle<State, any, any, any>> = {};

  assignForkId() {
    return this.nextForkOrdinal++;
  }

  assignEventId() {
    return this.nextEventOrdinal++;
  }

  async watchPlan<Args extends any[], Ending, Reaction>(
    plan: ActionPlan<Args, Ending, Reaction>,
    args: Args,
    parentId: Id | null = null
  ): Promise<Ending | Termination> {
    const idPrefix = parentId ? `${parentId}:` : "";
    const idSuffix = `${this.assignForkId()}-${plan.name}`;
    const id = idPrefix + idSuffix;
    const forkHandle = new ForkHandle(this, plan, args, id, parentId);
    this.forkHandles[id] = forkHandle;
    return await interceptPlan(plan, args, forkHandle);
  }
}

class ForkHandle<State, Args extends any[], Ending, Reaction>
  implements PlanInterceptor<Reaction> {
  actionPhases: ReadonlyArray<ActionPhase<State, Reaction>> = [];
  reactionPhases: ReadonlyArray<ReactionPhase<State, Reaction>> = [];

  constructor(
    readonly registry: ForkRegistry<State>,
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args,
    readonly id: Id,
    readonly parentId: Id | null
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
