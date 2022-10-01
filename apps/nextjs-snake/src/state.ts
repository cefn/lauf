import { createQueue, MessageQueue } from "@lauf/queue";
import { Immutable, Selector, Store, createStore } from "@lauf/store";

/** GAME STATE */

export type Model = {
  gameStore: Store<Game>;
  inputQueue: MessageQueue<DirectionInput>;
};

export interface Game {
  length: number;
  score: number;
  segments: Segment[];
  fruitPos: Vector;
  motion: Motion;
}

export interface Segment {
  pos: Vector;
  direction: Direction;
}

export function createModel(): Model {
  return {
    gameStore: createStore<Game>(INITIAL_STATE),
    inputQueue: createQueue<[Direction, boolean]>(),
  };
}

export const INITIAL_STATE: Immutable<Game> = {
  length: 3,
  score: 0,
  segments: [
    { pos: [0, 0], direction: "UP" },
    { pos: [0, -1], direction: "UP" },
    { pos: [0, -2], direction: "UP" },
  ],
  fruitPos: [0, 3],
  motion: null,
};

/** GAME STATE USED BY VIEW */

export const selectMotion: Selector<Game, Motion> = ({ motion }) => motion;
export const selectScore: Selector<Game, number> = ({ score }) => score;
export const selectSegments: Selector<Game, Segment[]> = ({ segments }) =>
  segments;
export const selectHead: Selector<Game, Segment> = ({ segments }) =>
  segments[0] as Segment;
export const selectFruitPos: Selector<Game, Vector> = ({ fruitPos }) =>
  fruitPos;

export function setMotion(store: Store<Game>, motion: Motion) {
  const state = store.read();
  store.write({
    ...state,
    motion,
  });
}

export type SegmentPosition = {
  segments: Segment[];
  index: number;
};

/** GAME GRID */

// grid is defined as central (zero) square with squares in each direction
// up to and including GRID_MAX
export const GRID_MAX = 5;
export const GRID_SPAN = 1 + 2 * GRID_MAX;

// export const gridArea = gridSpan * gridSpan;
export const GRID_DIGITS = Array.from(
  { length: GRID_SPAN },
  (_, i) => i - GRID_MAX
) as ReadonlyArray<number>;

/** DIRECTION VECTORS */
//TODO make readonly
export type Vector = readonly [number, number];

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

export const DIRECTION_OPPOSITES: Record<Direction, Direction> = {
  LEFT: "RIGHT",
  RIGHT: "LEFT",
  UP: "DOWN",
  DOWN: "UP",
} as const;

export type Direction = keyof typeof DIRECTION_VECTORS;
export type DirectionVector = typeof DIRECTION_VECTORS[Direction];
export type DirectionInput = [Direction, boolean];
export type Motion = Direction | null;

export const STEP_MS = 150;
