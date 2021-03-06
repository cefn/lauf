import { MessageQueue } from "@lauf/lauf-queue/src";
import { Selector, Store } from "@lauf/lauf-store";

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

/** APP STATE */

export interface AppState {
  color: Rgb;
}

export const selectColor: Selector<AppState> = (state) => state.color;

export interface AppModel {
  colorStore: Store<AppState>;
  changeQueue: MessageQueue<ColorChange>;
}
