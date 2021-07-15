import { wrap } from "../src/util/vector";
import { GRID_MAX as GM } from "../src/state";

const EDGE = GM + 1;

describe("wrap() vector calculations", () => {
  test("Wrap leaves coordinates inside grid unaffected", () => {
    expect(wrap([0, 0])).toEqual([0, 0]);
    expect(wrap([GM, 0])).toEqual([GM, 0]);
    expect(wrap([0, GM])).toEqual([0, GM]);
  });

  test("Wrap moves coordinates over edge to opposite edge", () => {
    expect(wrap([0, EDGE])).toEqual([0, -GM]);
    expect(wrap([EDGE, 0])).toEqual([-GM, 0]);
    expect(wrap([0, -EDGE])).toEqual([0, GM]);
    expect(wrap([-EDGE, 0])).toEqual([GM, 0]);
  });
});
