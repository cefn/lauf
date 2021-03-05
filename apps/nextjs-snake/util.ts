import { Immutable } from "@lauf/lauf-store";
import { Vector, gridEdge } from "./plan";

export function sum(vecA: Immutable<Vector>, vecB: Immutable<Vector>): Vector {
  return [vecA[0] + vecB[0], vecA[1] + vecB[1]];
}

export function wrap(vec: Vector): Vector {
  return vec.map((dim) => {
    const absDim = Math.abs(dim);
    if (absDim < gridEdge) {
      //doesn't need wrapping
      return dim;
    } else {
      //wrap the position
      return (Math.sign(dim) * absDim) % gridEdge;
    }
  }) as Vector;
}
