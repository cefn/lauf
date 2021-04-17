import {
  Action,
  ActionPlan,
  PlanRunner,
  Termination,
  BackgroundPlan,
} from "@lauf/lauf-runner";
import { Store } from "@lauf/lauf-store";
import { interceptPlan, PlanInterceptor } from "./intercept";
import { Id, ActionPhase, ReactionPhase } from "./types";

export class ForkRegistry<State> {
  protected nextForkOrdinal = 0;
  protected nextEventOrdinal = 0;
  protected initialState: State;
  forkHandles: Record<Id, ForkHandle<State, any, any, any>> = {};
  constructor(readonly store: Store<State>) {
    this.initialState = store.read();
  }

  assignForkId() {
    return this.nextForkOrdinal++;
  }

  assignEventId() {
    return this.nextEventOrdinal++;
  }

  //TODO use @lauf/lock to ensure watchPlan has terminated properly
  //and isn't still monitoring and manipulating resources in parallel
  async replayUntil(actionId: number) {
    const rootHandles = Object.values(this.forkHandles).filter(
      (handle) => handle.parentId === null
    );
    const [firstActionPhase] = rootHandles
      .map((rootHandle) => rootHandle.actionPhases)
      .filter(
        (actionPhases) => actionPhases.length && actionPhases[0]?.eventId === 0
      );
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

  getRunner<Args extends any[], Ending, Reaction>(
    parentId: Id
  ): PlanRunner<Args, Ending, Reaction> {
    return (plan: ActionPlan<Args, Ending, Reaction>, ...args: Args) =>
      this.watchPlan(plan, args, parentId);
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
    if (action instanceof BackgroundPlan) {
      action.runner = this.registry.getRunner(this.id);
    }
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
