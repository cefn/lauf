/** GAME STATE */

export interface AppModel {
  gameStore: Store<GameState>;
  steerQueue: MessageQueue<DirectionName>;
}

import { MessageQueue } from "@lauf/lauf-queue/src";
import { Immutable, Selector, Store } from "@lauf/lauf-store/src";

export interface GameState {
  length: number;
  segments: Segment[];
}

export interface Segment {
  pos: Vector;
}

export const selectSegments: Selector<GameState> = (state) => state.segments;

export const INITIAL_STATE: Immutable<GameState> = {
  length: 3,
  segments: [{ pos: [0, 0] }, { pos: [0, -1] }, { pos: [0, -2] }],
} as const;

/** GAME GRID */

// grid is defined as central (zero) square with squares in each direction
// up to and including GRID_MAX
export const GRID_MAX = 4;
export const GRID_SPAN = 1 + 2 * GRID_MAX;

// export const gridArea = gridSpan * gridSpan;
export const GRID_DIGITS = Array.from(
  { length: GRID_SPAN },
  (_, i) => i - GRID_MAX
) as ReadonlyArray<number>;

/** DIRECTION VECTORS */

export type Vector = [number, number];

export const LEFT = [-1, 0] as const;
export const UP = [0, 1] as const;
export const RIGHT = [1, 0] as const;
export const DOWN = [0, -1] as const;

export const DIRECTION_VECTORS = {
  LEFT,
  UP,
  RIGHT,
  DOWN,
} as const;

export const DIRECTION_OPPOSITES: Record<DirectionName, DirectionName> = {
  LEFT: "RIGHT",
  RIGHT: "LEFT",
  UP: "DOWN",
  DOWN: "UP",
};

export type DirectionName = keyof typeof DIRECTION_VECTORS;
export type Direction = typeof DIRECTION_VECTORS[DirectionName];
