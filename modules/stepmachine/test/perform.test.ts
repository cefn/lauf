import { describe, test, expect } from "vitest";
import { fromAsync } from "../../stopwatch/test/util";
import { createPerformance, promiseEnding, step } from "../src/perform";
import { Plan } from "../src/types";

describe("Plan utility functions: ", () => {
  describe("Single operation type", () => {
    describe("Synchronous addition", () => {
      const add = (x: number, y: number) => x + y;

      const plan = function* () {
        let value = 0;
        while (value < 3) {
          value = yield* step(add, value, 1);
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
          [add, 0, 1],
          1,
          [add, 1, 1],
          2,
          [add, 2, 1],
          3,
        ]);
      });
    });

    describe("Asynchronous addition", () => {
      const add = (x: number, y: number) =>
        new Promise<number>((resolve) => setTimeout(resolve, 0, x + y));

      const plan = function* () {
        let value = 0;
        while (value < 3) {
          value = yield* step(add, value, 1);
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
          [add, 0, 1],
          1,
          [add, 1, 1],
          2,
          [add, 2, 1],
          3,
        ]);
      });
    });
  });

  describe("Single operation type", () => {
    describe("Asynchronous count messages", () => {
      const promiseAdd = (x: number, y: number) =>
        new Promise<number>((resolve) => setTimeout(resolve, 0, x + y));
      const promiseCountMessage = (x: number) =>
        new Promise<string>((resolve) =>
          setTimeout(resolve, 0, `${x} pencil${x === 1 ? "" : "s"}`)
        );
      const promiseLog = (message: string) =>
        new Promise<void>((resolve) =>
          setTimeout(() => resolve(console.log(message)), 0)
        );

      type TestPlan = Plan<
        number,
        typeof promiseAdd | typeof promiseCountMessage | typeof promiseLog
      >;

      const plan: TestPlan = function* () {
        let value = 0;
        while (value < 2) {
          value = yield* step(promiseAdd, value, 1);
          const message = yield* step(promiseCountMessage, value);
          yield* step(promiseLog, message);
        }
        return value;
      };

      test("promiseEnding() resolves to ending", async () => {
        const ending = await promiseEnding(plan);
        expect(ending).toBe(2);
      });

      test("createPerformance() return value can be iterated to perform plan", async () => {
        const performance = createPerformance(plan);
        const steps = await fromAsync(performance);
        expect(steps).toMatchObject([
          [promiseAdd, 0, 1],
          1,
          [promiseCountMessage, 1],
          "1 pencil",
          [promiseLog, "1 pencil"],
          undefined,
          [promiseAdd, 1, 1],
          2,
          [promiseCountMessage, 2],
          "2 pencils",
          [promiseLog, "2 pencils"],
          undefined,
        ]);
      });
    });
  });
});

// type Fn = (...args:unknown[]) => unknown;
// const add:Fn = (x: number, y: number) => x + y;
