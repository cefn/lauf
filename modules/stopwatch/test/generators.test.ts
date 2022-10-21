import { describe, test, expect } from "vitest";

/** Placeholder for experiments with generators. Initially just a simple
 * demonstration that an object with a next() implementation is enough to
 * provide an iterable that can be spread to create a new array */

describe("Generators", () => {
  test("Array spread can be fulfilled with next()", () => {
    const results = [
      { done: false, value: 3 },
      { done: false, value: 4 },
      { done: false, value: 5 },
      { done: true, value: undefined },
    ];
    let resultPos = 0;
    const generator = {
      next() {
        return results[resultPos++];
      },
      [Symbol.iterator]() {
        return this;
      },
    };

    const values = [...generator];
    expect(values).toStrictEqual([3, 4, 5]);
  });
});
