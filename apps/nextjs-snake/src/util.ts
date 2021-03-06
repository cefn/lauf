import { Immutable } from "@lauf/lauf-store";
import { GRID_MAX, GRID_SPAN, Vector } from "./domain";

export function plus(a: Immutable<Vector>, b: Immutable<Vector>): Vector {
  return [a[0] + b[0], a[1] + b[1]];
}

export function minus(a: Immutable<Vector>, b: Immutable<Vector>): Vector {
  return [a[0] - b[0], a[1] - b[1]];
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
