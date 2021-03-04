import { Immutable } from "@lauf/lauf-store";

export type Rgb = [number, number, number];

export interface AppState {
  color: Rgb;
}

export const colorVectors: Record<string, Readonly<Rgb>> = {
  red: [1, 0, 0],
  green: [0, 1, 0],
  blue: [0, 0, 1],
} as const;
type ColorName = keyof typeof colorVectors;

export type ColorCommand = [ColorName, number];

export const selectColor = (state: Immutable<AppState>) => state.color;
