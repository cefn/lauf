import { Immutable } from "@lauf/lauf-store/src";

export type Rgb = [number, number, number];

export type Hue = Immutable<[0 | 1, 0 | 1, 0 | 1]>;
export const RED: Hue = [1, 0, 0] as const;
export const GREEN: Hue = [0, 1, 0] as const;
export const BLUE: Hue = [0, 0, 1] as const;

export interface AppState {
  color: Rgb;
}

export const INITIAL_STATE: Immutable<AppState> = {
  color: [0, 0, 0],
} as const;
