import { plus, wrap } from "../util";
import { gridMax } from "../plan";

describe("wrap() vector calculations", () => {
  test("Wrap leaves coordinates inside grid unaffected", () => {
    expect(wrap([0, 0])).toEqual([0, 0]);
    expect(wrap([gridMax, 0])).toEqual([gridMax, 0]);
    expect(wrap([0, gridMax])).toEqual([0, gridMax]);
  });

  test("Wrap moves coordinates over edge to opposite edge", () => {
    const edge = gridMax + 1;
    expect(wrap([0, edge])).toEqual([0, -gridMax]);
    expect(wrap([edge, 0])).toEqual([-gridMax, 0]);
    expect(wrap([0, -edge])).toEqual([0, gridMax]);
    expect(wrap([-edge, 0])).toEqual([gridMax, 0]);
  });
});
