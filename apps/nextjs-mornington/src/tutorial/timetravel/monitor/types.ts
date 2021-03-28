import { Action, ActionPlan } from "@lauf/lauf-runner";
import { Immutable, Store } from "@lauf/lauf-store";

class Phase<State> {
  constructor(
    readonly prevState: Immutable<State>,
    readonly eventOrdinal: number,
    readonly timestamp: number
  ) {}
}

class ActionPhase<State, Reaction> extends Phase<State> {
  constructor(
    readonly action: Action<Reaction>,
    readonly prevState: Immutable<State>,
    readonly eventOrdinal: number,
    readonly timestamp: number
  ) {
    super(prevState, eventOrdinal, timestamp);
  }
}

class ReactionPhase<State, Reaction> extends Phase<State> {
  constructor(
    readonly reaction: Reaction,
    readonly prevState: Immutable<State>,
    readonly eventOrdinal: number,
    readonly timestamp: number
  ) {
    super(prevState, eventOrdinal, timestamp);
  }
}

class ProcessLog<State, Args extends any[], Ending, Reaction> {
  constructor(
    readonly store: Store<State>,
    readonly plan: ActionPlan<Args, Ending, Reaction>,
    readonly args: Args
  ) {
    this.actionPhases = [];
    this.reactionPhases = [];
  }
  actionPhases: ActionPhase<State, Reaction>[];
  reactionPhases: ReactionPhase<State, Reaction>[];
  ending: Ending | undefined;
  logAction<Reaction>(action: Action<Reaction>) {
    const prevState = this.store.read();
  }
  logReaction<Reaction>(action: Reaction) {}
}

class AppLog<State, Args extends any[], Ending, Reaction> {
  constructor(readonly store: Store<State>) {}
  private nextProcessOrdinal = 0;
  private nextEventOrdinal = 0;
  async perform(
    plan: ActionPlan<Args, Ending, Reaction>,
    ...args: Args
  ): Ending {
    const id = `${plan.name}_${this.nextProcessOrdinal++}`;
    const processLog = new ProcessLog(this.store, plan, args);
  }

  processLogs: {
    [key: string]: ProcessLog<State, any, any, any>;
  } = {};
}
