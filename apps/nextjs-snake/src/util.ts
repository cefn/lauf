import { isDeepStrictEqual } from "util";

import { Immutable } from "@lauf/lauf-store";
import {
  GRID_MAX,
  GRID_SPAN,
  DIRECTION_VECTORS,
  Vector,
  Direction,
  DirectionName,
  Segment,
} from "./domain";

export function plus(a: Immutable<Vector>, b: Immutable<Vector>): Vector {
  return [a[0] + b[0], a[1] + b[1]];
}

export function minus(a: Immutable<Vector>, b: Immutable<Vector>): Vector {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scale(vec: Immutable<Vector>, factor: number): Vector {
  return [vec[0] * factor, vec[1] * factor];
}

function isDirection(vector: Readonly<Vector>): vector is Direction {
  for (const direction of Object.values(DIRECTION_VECTORS)) {
    if (isDeepStrictEqual(vector, direction)) {
      return true;
    }
  }
  return false;
}

export function getDirection(
  a: Immutable<Vector>,
  b: Immutable<Vector>
): Direction | null {
  //if points are on opposite sides, they are one step away
  const difference = minus(a, b).map((dim) =>
    Math.abs(dim) === GRID_MAX * 2 ? -Math.sign(dim) : dim
  ) as Vector;
  if (isDirection(difference)) {
    return difference;
  }
  return null;
}

export function wrap(vec: Vector): Vector {
  return vec.map((dim) => {
    const edgeOffset = dim + GRID_MAX;
    if (edgeOffset >= 0 && edgeOffset < GRID_SPAN) {
      return dim;
    } else {
      return ((edgeOffset + GRID_SPAN) % GRID_SPAN) - GRID_MAX;
    }
  }) as Vector;
}

export function getNeighborDirections(
  segments: Segment[],
  index: number
): [Direction, Direction] {
  const segment = segments[index] as Segment;
  let forward = null;
  if (index > 0) {
    const forwardSegment = segments[index - 1] as Segment;
    forward = getDirection(segment.pos, forwardSegment.pos);
  }
  let backward = null;
  if (index < segments.length - 1) {
    const backwardSegment = segments[index + 1] as Segment;
    backward = getDirection(segment.pos, backwardSegment.pos);
  }
  return [forward as Direction, backward as Direction];
}

export function getNeighborDirectionNames(segments: Segment[], index: number) {
  return getNeighborDirections(segments, index).map(getDirectionName) as [
    DirectionName,
    DirectionName
  ];
}

function getDirectionName(vector: Direction): DirectionName {
  for (const [name, direction] of Object.entries(DIRECTION_VECTORS)) {
    if (isDeepStrictEqual(vector, direction)) {
      return name as DirectionName;
    }
  }
  throw `Vector ${vector} not found in DIRECTION_VECTORS`;
}
