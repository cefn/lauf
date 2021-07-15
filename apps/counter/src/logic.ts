import { Editor, Immutable, Store } from "@lauf/store";

export interface AppState {
  counter: number;
}

export const INITIAL_STATE: Immutable<AppState> = {
  counter: 0,
} as const;

export const increment: Editor<AppState> = (draft) => (draft.counter += 1);

export const decrement: Editor<AppState> = (draft) => (draft.counter -= 1);
