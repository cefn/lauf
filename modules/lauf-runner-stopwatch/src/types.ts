import { Action, ActionPlan } from "@lauf/lauf-runner";
import { Immutable } from "@lauf/lauf-store";

export interface PlanHistory<State, Args extends any[], Ending, Reaction> {
  initialState: Immutable<State>;
  plan: ActionPlan<Args, Ending, Reaction>;
  args: Args;
  actionPhases: ReadonlyArray<ActionPhase<State, Reaction>>;
  reactionPhases: ReadonlyArray<ReactionPhase<State, Reaction>>;
  forkHistories: {
    [key: string]: PlanHistory<State, any, any, Reaction>;
  };
}

interface Phase<State> {
  prevState: Immutable<State>;
  eventOrdinal: number;
  timestamp: number;
}

interface ActionPhase<State, Reaction> extends Phase<State> {
  action: Action<Reaction>;
}

interface ReactionPhase<State, Reaction> extends Phase<State> {
  reaction: Reaction;
}
