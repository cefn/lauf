import { BasicMessageQueue, MessageQueue } from "@lauf/lauf-queue/src";
import { BasicStore, Immutable, Selector, Store } from "@lauf/lauf-store/src";

/** GAME STATE */

export interface AppModel {
  gameStore: Store<GameState>;
  inputQueue: MessageQueue<DirectionInput>;
}

export interface GameState {
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

export function createAppModel(): AppModel {
  return {
    gameStore: new BasicStore<GameState>(INITIAL_STATE),
    inputQueue: new BasicMessageQueue<[Direction, boolean]>(),
  };
}

export const INITIAL_STATE: Immutable<GameState> = {
  length: 3,
  score: 0,
  segments: [
    { pos: [0, 0], direction: "UP" },
    { pos: [0, -1], direction: "UP" },
    { pos: [0, -2], direction: "UP" },
  ],
  fruitPos: [0, 3],
  motion: null,
} as const;

/** GAME STATE USED BY VIEW */

export const selectMotion = (state: Immutable<GameState>) => state.motion;
export const selectScore = (state: Immutable<GameState>) => state.score;
export const selectSegments: Selector<GameState, Immutable<Segment[]>> = (
  state
) => state.segments;
export const selectHead: Selector<GameState, Segment> = (state) =>
  state.segments[0] as Segment;
export const selectFruitPos: Selector<GameState, Immutable<Vector>> = (state) =>
  state.fruitPos;

export type StoreProps = {
  gameStore: Store<GameState>;
};

export type SegmentPosition = {
  segments: Segment[];
  index: number;
};

/** GAME GRID */

// grid is defined as central (zero) square with squares in each direction
// up to and including GRID_MAX
export const GRID_MAX = 10;
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
