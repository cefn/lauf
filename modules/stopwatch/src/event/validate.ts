import { ensureValuesEqual, shallowEquals } from "../util";
import { CaptureEvent } from "./types";

function validatedCall<
  E extends CaptureEvent<unknown, unknown, unknown>,
  P extends Partial<CaptureEvent<unknown, unknown, unknown>>
>(actual: E, expected: P) {
  if (!shallowEquals(actual, expected)) {
    throw new Error(
      `Event ${JSON.stringify(actual)} doesn't match ${JSON.stringify(
        expected
      )}`
    );
  }
  return actual;
}

export function validatedNextCall<
  TNext,
  E extends CaptureEvent<unknown, unknown, TNext>
>(event: E, ...args: [TNext] | []) {
  const validatedEvent = validatedCall(event, {
    called: "next",
  });
  const [nextValue] = args;
  ensureValuesEqual(
    validatedEvent.nextValue,
    nextValue,
    "CalledEvent#nextValue inconsistent"
  );
  return validatedEvent;
}

export function validatedReturnCall<
  TReturn,
  E extends CaptureEvent<unknown, TReturn, unknown>
>(event: E, returnValue: TReturn) {
  const validatedEvent = validatedCall(event, { called: "return" });
  ensureValuesEqual(
    validatedEvent.returnValue,
    returnValue,
    "CalledEvent#returnValue inconsistent"
  );
  return validatedEvent;
}

export function validatedThrowCall<
  E extends CaptureEvent<unknown, unknown, unknown>
>(event: E, thrownValue: unknown) {
  const validatedEvent = validatedCall(event, { called: "throw" });
  ensureValuesEqual(
    validatedEvent.thrownValue,
    thrownValue,
    "CalledEvent#thrownValue inconsistent"
  );
  return validatedEvent;
}
