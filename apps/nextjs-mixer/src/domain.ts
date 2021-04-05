import { MessageQueue } from "@lauf/lauf-queue";
import { Selector, Store } from "@lauf/lauf-store";

/** APP STATE */

export interface AppState {
  color: Rgb;
}

export const INITIAL_STATE = {
  color: [0, 0, 0],
} as const;

export const selectColor: Selector<AppState, Rgb> = (state) => state.color;

export interface AppModel {
  colorStore: Store<AppState>;
  changeQueue: MessageQueue<ColorChange>;
  increaseColor: (color: ColorName) => void;
  decreaseColor: (color: ColorName) => void;
}

/** COLOR */

export const RED = [1, 0, 0] as const;
export const GREEN = [0, 1, 0] as const;
export const BLUE = [0, 0, 1] as const;

export const RGB_LOOKUP = {
  RED,
  GREEN,
  BLUE,
} as const;

export type Rgb = [number, number, number];

export type ColorName = keyof typeof RGB_LOOKUP;

export type ColorChange = [ColorName, number];
