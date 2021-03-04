import { Selector } from "@lauf/lauf-store";

export const colorVectors: Record<string, Readonly<Rgb>> = {
  red: [1, 0, 0],
  green: [0, 1, 0],
  blue: [0, 0, 1],
} as const;

export const selectColor: Selector<AppState> = (state) => state.color;

export interface AppState {
  color: Rgb;
}

export type Rgb = [number, number, number];

export type ColorName = keyof typeof colorVectors;

export type ColorChange = [ColorName, number];
