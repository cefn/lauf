import { Immutable, Store } from "@lauf/store";

export interface AppState {
  counter: number;
}

export const INITIAL_STATE: Immutable<AppState> = {
  counter: 0,
} as const;

export const increment = (store: Store<AppState>) =>
  store.edit((draft) => (draft.counter += 1));

export const decrement = (store: Store<AppState>) =>
  store.edit((draft) => (draft.counter -= 1));
