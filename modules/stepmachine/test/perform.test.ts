import { describe, test, expect } from "vitest";
import { fromAsync } from "../../stopwatch/test/util";
import { createPerformance, promiseEnding } from "../src/perform";
import { step } from "../src/types";

describe("Plan utility functions: ", () => {
  describe("Synchronous addition", () => {
    const add = (x: number, y: number) => x + y;

    const plan = function* () {
      let value = 0;
      while (value < 3) {
        value = yield step(add, value, 1);
      }
      return value;
    };

    test("promiseEnding() resolves to ending", async () => {
      const ending = await promiseEnding(plan);
      expect(ending).toBe(3);
    });

    test("createPerformance() return value can be iterated to perform plan", async () => {
      const performance = createPerformance(plan);
      const steps = await fromAsync(performance);
      expect(steps).toMatchObject([
        [[add, 0, 1], 1],
        [[add, 1, 1], 2],
        [[add, 2, 1], 3],
      ]);
    });
  });

  describe("Asynchronous addition", () => {
    const add = (x: number, y: number) =>
      new Promise((resolve) => setTimeout(resolve, 0, x + y));

    const plan = function* () {
      let value = 0;
      while (value < 3) {
        value = yield step(add, value, 1);
      }
      return value;
    };

    test("promiseEnding() resolves to ending", async () => {
      const ending = await promiseEnding(plan);
      expect(ending).toBe(3);
    });

    test("createPerformance() return value can be iterated to perform plan", async () => {
      const performance = createPerformance(plan);
      const steps = await fromAsync(performance);
      expect(steps).toMatchObject([
        [[add, 0, 1], 1],
        [[add, 1, 1], 2],
        [[add, 2, 1], 3],
      ]);
    });
  });
});

// type Fn = (...args:unknown[]) => unknown;
// const add:Fn = (x: number, y: number) => x + y;
