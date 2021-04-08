import { Action } from "@lauf/lauf-runner";

export type Id = string;

export interface Phase<State> {
  prevState: State;
  eventId: number;
  timestamp: number;
}

export interface ActionPhase<State, Reaction> extends Phase<State> {
  action: Action<Reaction>;
}

export interface ReactionPhase<State, Reaction> extends Phase<State> {
  reaction: Reaction;
}
