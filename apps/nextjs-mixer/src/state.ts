import { Immutable } from "@lauf/store";

export type Rgb = [number, number, number];

export const RED = [1, 0, 0] as const;
export const GREEN = [0, 1, 0] as const;
export const BLUE = [0, 0, 1] as const;

const HUES = [RED, GREEN, BLUE] as const;
export type Hue = typeof HUES[number];

export interface AppState {
  color: Rgb;
}

export const INITIAL_STATE: Immutable<AppState> = {
  color: [0, 0, 0],
} as const;
