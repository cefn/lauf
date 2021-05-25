import { Immutable } from "@lauf/lauf-store/src";
import { GRID_MAX, GRID_SPAN, Vector } from "./domain";

export function randomSquare(): Vector {
  return [
    Math.floor(Math.random() * GRID_SPAN) - GRID_MAX,
    Math.floor(Math.random() * GRID_SPAN) - GRID_MAX,
  ];
}

export function isVectorEqual(
  a: Immutable<Vector>,
  b: Immutable<Vector>
): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export function plus(a: Immutable<Vector>, b: Immutable<Vector>): Vector {
  return [a[0] + b[0], a[1] + b[1]];
}

export function minus(a: Immutable<Vector>, b: Immutable<Vector>): Vector {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scale(vec: Immutable<Vector>, factor: number): Vector {
  return [vec[0] * factor, vec[1] * factor];
}

export function wrap(vec: Immutable<Vector>): Vector {
  return (vec.map((dim) => {
    const edgeOffset = dim + GRID_MAX;
    if (edgeOffset >= 0 && edgeOffset < GRID_SPAN) {
      return dim;
    } else {
      return ((edgeOffset + GRID_SPAN) % GRID_SPAN) - GRID_MAX;
    }
  }) as unknown) as Vector;
}
