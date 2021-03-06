import { plus, minus, wrap } from "../src/util";
import { GRID_MAX } from "../src/domain";

describe("wrap() vector calculations", () => {
  test("Wrap leaves coordinates inside grid unaffected", () => {
    expect(wrap([0, 0])).toEqual([0, 0]);
    expect(wrap([GRID_MAX, 0])).toEqual([GRID_MAX, 0]);
    expect(wrap([0, GRID_MAX])).toEqual([0, GRID_MAX]);
  });

  test("Wrap moves coordinates over edge to opposite edge", () => {
    const edge = GRID_MAX + 1;
    expect(wrap([0, edge])).toEqual([0, -GRID_MAX]);
    expect(wrap([edge, 0])).toEqual([-GRID_MAX, 0]);
    expect(wrap([0, -edge])).toEqual([0, GRID_MAX]);
    expect(wrap([-edge, 0])).toEqual([GRID_MAX, 0]);
  });
});
