import {
  directSequence,
  Action,
  ActionPlan,
  Performer,
  Termination,
  BackgroundPlan,
} from "@lauf/lauf-runner";
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
    prevState: Immutable<State>,
    eventOrdinal: number,
    timestamp: number
  ) {
    super(prevState, eventOrdinal, timestamp);
  }
}

class ReactionPhase<State, Reaction> extends Phase<State> {
  constructor(
    readonly reaction: Reaction,
    prevState: Immutable<State>,
    eventOrdinal: number,
    timestamp: number
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
  logAction(action: Action<Reaction>, eventOrdinal: number) {
    const prevState = this.store.read();
    const timestamp = new Date().getTime();
    this.actionPhases = [
      ...this.actionPhases,
      new ActionPhase<State, Reaction>(
        action,
        prevState,
        eventOrdinal,
        timestamp
      ),
    ];
  }
  logReaction(reaction: Reaction, eventOrdinal: number) {
    const prevState = this.store.read();
    const timestamp = new Date().getTime();
    this.reactionPhases = [
      ...this.reactionPhases,
      new ReactionPhase<State, Reaction>(
        reaction,
        prevState,
        eventOrdinal,
        timestamp
      ),
    ];
  }
}

//TODO look into 'wrapping' another performer rather than reimplementing
//actor? BTW it's impossible to wrap a performANCE as it's stateful and
//we need to reset the generator to its initial state beforehand
class AppLog<State> {
  constructor(readonly store: Store<State>) {}
  private nextProcessOrdinal = 0;
  private nextEventOrdinal = 0;
  async performPlan<Args extends any[], Ending, Reaction>(
    plan: ActionPlan<Args, Ending, Reaction>,
    ...args: Args
  ): Promise<Ending | Termination> {
    const processId = `${plan.name}_${this.nextProcessOrdinal++}`;
    const processLog = new ProcessLog(this.store, plan, args);
    this.processLogs[processId] = processLog;
    const appLog = this;
    const loggingActor: Performer<never, any> = async function* () {
      let action = yield;
      while (true) {
        processLog.logAction(action, appLog.nextEventOrdinal++);
        let reaction;
        if (action instanceof BackgroundPlan) {
          reaction = appLog.performPlan(action.plan, action.args);
        } else {
          reaction = await action.act();
        }
        processLog.logReaction(reaction, appLog.nextEventOrdinal++);
        action = yield reaction;
      }
    };
    return await directSequence(plan(...args), loggingActor());
  }
  processLogs: {
    [key: string]: ProcessLog<State, any, any, any>;
  } = {};
}
