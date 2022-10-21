import { GeneratorFnEvent, GeneratorFnResult } from "../../src/event/types";
import { EventRecorder } from "../../src/replay/generatorRecorder";
import { describe, test, expect, vi as jest } from "vitest";

describe("Stopwatch: ", () => {
  describe("RecordedSequence ", () => {
    test("Serves sequence from source generator", () => {
      const recordedSequence = new EventRecorder(
        function* createNumberSequence() {
          yield* [3, 4, 5];
        }
      );
      const generated = [...recordedSequence];
      expect(generated).toStrictEqual([3, 4, 5]);
    });

    test("RecordedSequence captures generatorNext, generatorReturn if generator yields once", () => {
      let nextValue: string | null = null;

      const pongOnce = function* () {
        nextValue = yield "pong";
      };
      type Result = GeneratorFnResult<typeof pongOnce>;
      type Event = GeneratorFnEvent<typeof pongOnce>;

      const recordedSequence = new EventRecorder(pongOnce);

      const nextResult = recordedSequence.next();
      const returnResult = recordedSequence.next("ping");
      expect(nextResult).toStrictEqual<Result>({
        done: false,
        value: "pong",
      });
      expect(returnResult).toStrictEqual<Result>({
        done: true,
        value: undefined,
      });

      expect(nextValue).toBe("ping");

      const { events: records } = recordedSequence;
      expect(records.length).toBe(2);

      const [nextRecord, returnRecord] = records;
      expect(nextRecord).toStrictEqual<Event>({
        called: "next",
        nextValue: undefined,
        generated: "yield",
        result: {
          done: false,
          value: "pong",
        },
      });
      expect(returnRecord).toStrictEqual<Event>({
        called: "next",
        nextValue: "ping",
        generated: "return",
        result: {
          done: true,
          value: undefined,
        },
      });
    });

    test("RecordedSequence captures generatorReturn if generator returns immediately", () => {
      const returnImmediately = function* () {
        return "ending";
      };
      type Result = GeneratorFnResult<typeof returnImmediately>;
      type Event = GeneratorFnEvent<typeof returnImmediately>;

      const recordedSequence = new EventRecorder(returnImmediately);

      const value = recordedSequence.next();

      expect(value).toEqual<Result>({
        done: true,
        value: "ending",
      });

      const { events } = recordedSequence;
      expect(events.length).toBe(1);

      const [event] = events;
      expect(event).toStrictEqual<Event>({
        called: "next",
        nextValue: undefined,
        generated: "return",
        result: {
          done: true,
          value: "ending",
        },
      });
    });

    test("RecordedSequence captures generatorThrow", () => {
      const throwImmediately = function* () {
        throw new Error("It all went to heck");
      };
      type Event = GeneratorFnEvent<typeof throwImmediately>;

      const recordedSequence = new EventRecorder(throwImmediately);

      try {
        const value = recordedSequence.next();
        throw new Error("This line should never be reached");
      } catch (thrown) {
        expect(thrown).toEqual(new Error("It all went to heck"));
      }

      const { events } = recordedSequence;
      expect(events.length).toBe(1);

      const [event] = events;
      expect(event).toStrictEqual<Event>({
        called: "next",
        nextValue: undefined,
        generated: "throw",
        thrown: new Error("It all went to heck"),
      });
    });

    test("RecordedSequence captures callerReturn", () => {
      const finallySpy = jest.fn();

      const withFinally = function* (): Generator<string, string, string> {
        try {
          for (;;) {
            const nextValue = yield "foo";
          }
        } finally {
          finallySpy();
        }
      };
      type Result = GeneratorFnResult<typeof withFinally>;
      type Event = GeneratorFnEvent<typeof withFinally>;

      const recordedSequence = new EventRecorder(withFinally);

      const nextResult = recordedSequence.next("bar"); // complete first yield
      const returnResult = recordedSequence.return("baz");
      expect(finallySpy).toBeCalledTimes(1);

      expect(nextResult).toStrictEqual<Result>({
        done: false,
        value: "foo",
      });

      expect(returnResult).toStrictEqual<Result>({
        done: true,
        value: "baz",
      });

      const { events } = recordedSequence;
      expect(events.length).toBe(2);

      const [nextEvent, callerReturnEvent] = events;
      expect(nextEvent).toStrictEqual<Event>({
        called: "next",
        nextValue: "bar",
        generated: "yield",
        result: {
          done: false,
          value: "foo",
        },
      });
      expect(callerReturnEvent).toStrictEqual<Event>({
        called: "return",
        returnValue: "baz",
        generated: "return",
        result: {
          done: true,
          value: "baz",
        },
      });
    });

    test("RecordedSequence captures callerThrow", () => {
      const catchSpy = jest.fn();

      const withCatch = function* (): Generator<string, string, string> {
        try {
          for (;;) {
            const nextValue = yield "foo";
          }
        } catch (thrown) {
          catchSpy(thrown);
        }
        return "bar";
      };
      type Result = GeneratorFnResult<typeof withCatch>;
      type Event = GeneratorFnEvent<typeof withCatch>;

      const recordedSequence = new EventRecorder(withCatch);

      const nextResult = recordedSequence.next("bar"); // complete first yield
      recordedSequence.throw(new Error("Caller threw this"));
      expect(catchSpy).toBeCalledTimes(1);
      expect(catchSpy).lastCalledWith(new Error("Caller threw this"));

      expect(nextResult).toStrictEqual<Result>({
        done: false,
        value: "foo",
      });

      const { events } = recordedSequence;
      expect(events.length).toBe(2);

      const [nextEvent, callerThrowEvent] = events;
      expect(nextEvent).toStrictEqual<Event>({
        called: "next",
        nextValue: "bar",
        generated: "yield",
        result: {
          done: false,
          value: "foo",
        },
      });
      expect(callerThrowEvent).toStrictEqual<Event>({
        called: "throw",
        thrownValue: new Error("Caller threw this"),
        generated: "return",
        result: {
          done: true,
          value: "bar",
        },
      });
    });
  });
});

describe("", () => {
  test("", () => {});
});
