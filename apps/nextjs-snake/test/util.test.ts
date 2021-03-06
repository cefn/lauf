import { plus, minus, wrap, direction } from "../src/util";
import { GRID_MAX } from "../src/domain";

const EDGE = GRID_MAX + 1;

describe("wrap() vector calculations", () => {
  test("Wrap leaves coordinates inside grid unaffected", () => {
    expect(wrap([0, 0])).toEqual([0, 0]);
    expect(wrap([GRID_MAX, 0])).toEqual([GRID_MAX, 0]);
    expect(wrap([0, GRID_MAX])).toEqual([0, GRID_MAX]);
  });

  test("Wrap moves coordinates over edge to opposite edge", () => {
    expect(wrap([0, EDGE])).toEqual([0, -GRID_MAX]);
    expect(wrap([EDGE, 0])).toEqual([-GRID_MAX, 0]);
    expect(wrap([0, -EDGE])).toEqual([0, GRID_MAX]);
    expect(wrap([-EDGE, 0])).toEqual([GRID_MAX, 0]);
  });
});

describe("direction() vector calculations", () => {
  test("direction handles central cases", () => {
    expect(direction([0, 0], [0, -1])).toEqual("LEFT");
  });
});
