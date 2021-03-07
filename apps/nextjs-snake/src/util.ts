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

export function isVectorEqual(
  a: Immutable<Vector>,
  b: Immutable<Vector>
): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function isDirection(vector: Readonly<Vector>): vector is Direction {
  for (const direction of Object.values(DIRECTION_VECTORS)) {
    if (isVectorEqual(vector, direction)) {
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

  const difference = minus(b, a);
  const wrapDifference = difference.map((dim) =>
    Math.abs(dim) === GRID_MAX * 2 ? -Math.sign(dim) : dim
  ) as Vector;
  if (isDirection(wrapDifference)) {
    return wrapDifference;
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
): [Direction | null, Direction | null] {
  const segment = segments[index] as Segment;
  let fore = null;
  if (index > 0) {
    const foreSegment = segments[index - 1] as Segment;
    fore = getDirection(segment.pos, foreSegment.pos);
  }
  let aft = null;
  if (index < segments.length - 1) {
    const aftSegment = segments[index + 1] as Segment;
    aft = getDirection(aftSegment.pos, segment.pos);
  }
  return [fore, aft];
}

export function getNeighborDirectionNames(segments: Segment[], index: number) {
  return getNeighborDirections(segments, index).map((direction) =>
    direction ? getDirectionName(direction) : null
  );
}

function getDirectionName(vector: Direction): DirectionName | null {
  for (const [name, direction] of Object.entries(DIRECTION_VECTORS)) {
    if (isVectorEqual(vector, direction)) {
      return name as DirectionName;
    }
  }
  return null;
}
