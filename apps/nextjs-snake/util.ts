import { Immutable } from "@lauf/lauf-store";
import { Vector, gridMax, gridSpan } from "./plan";

export function plus(vecA: Immutable<Vector>, vecB: Immutable<Vector>): Vector {
  return [vecA[0] + vecB[0], vecA[1] + vecB[1]];
}

export function minus(
  vecA: Immutable<Vector>,
  vecB: Immutable<Vector>
): Vector {
  return [vecA[0] - vecB[0], vecA[1] - vecB[1]];
}

export function wrap(vec: Vector): Vector {
  return vec.map((dim) => {
    const edgeOffset = dim + gridMax;
    if (edgeOffset >= 0 && edgeOffset < gridSpan) {
      return dim;
    } else {
      return ((edgeOffset + gridSpan) % gridSpan) - gridMax;
    }
  }) as Vector;
}
