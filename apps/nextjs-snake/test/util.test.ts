import { plus, minus, wrap, getDirection } from "../src/util";
import { DOWN, GRID_MAX as GM, LEFT, RIGHT, UP } from "../src/domain";

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

describe("getDirection() vector calculations", () => {
  test("getDirection() handles identity cases", () => {
    expect(getDirection([0, 0], LEFT)).toEqual(LEFT);
    expect(getDirection([0, 0], UP)).toEqual(UP);
    expect(getDirection([0, 0], RIGHT)).toEqual(RIGHT);
    expect(getDirection([0, 0], DOWN)).toEqual(DOWN);
  });

  test("getDirection() handles edge cases", () => {
    expect(getDirection([-GM, 0], [GM, 0])).toEqual(LEFT);
    expect(getDirection([0, GM], [0, -GM])).toEqual(UP);
    expect(getDirection([GM, 0], [-GM, 0])).toEqual(RIGHT);
    expect(getDirection([0, -GM], [0, +GM])).toEqual(DOWN);
  });

  test("straight snake crossing an edge has single direction", () => {
    expect(getDirection([4, 2], [-4, 2])).toEqual([1, 0]);
    expect(getDirection([3, 2], [4, 2])).toEqual([1, 0]);
  });

  test("getDirection() handles corner cases", () => {
    expect(getDirection([-GM, GM], [GM, GM])).toEqual(LEFT);
    expect(getDirection([GM, GM], [GM, -GM])).toEqual(UP);
    expect(getDirection([GM, GM], [-GM, GM])).toEqual(RIGHT);
    expect(getDirection([GM, -GM], [GM, +GM])).toEqual(DOWN);

    expect(getDirection([-GM, -GM], [GM, -GM])).toEqual(LEFT);
    expect(getDirection([-GM, GM], [-GM, -GM])).toEqual(UP);
    expect(getDirection([GM, -GM], [-GM, -GM])).toEqual(RIGHT);
    expect(getDirection([-GM, -GM], [-GM, +GM])).toEqual(DOWN);
  });
});
