import { CalledEvent, CaptureEvent } from "./types";

export function captureCall<T, TReturn, TNext>(
  calledEvent: CalledEvent<TReturn, TNext>,
  iteration: () => IteratorResult<T, TReturn>
) {
  try {
    const result = iteration();
    if (!result.done) {
      return {
        ...calledEvent,
        generated: "yield",
        result,
      } as const;
    } else {
      return {
        ...calledEvent,
        generated: "return",
        result,
      } as const;
    }
  } catch (thrown) {
    return {
      ...calledEvent,
      generated: "throw",
      thrown,
    } as const;
  }
}

export function captureNextCall<T, TReturn, TNext>(
  generator: Generator<T, TReturn, TNext>,
  ...args: [] | [TNext]
): CaptureEvent<T, TReturn, TNext> {
  const [nextValue] = args;
  return captureCall({ called: "next", nextValue }, () =>
    generator.next(...args)
  );
}

export function captureReturnCall<T, TReturn, TNext>(
  generator: Generator<T, TReturn, TNext>,
  returnValue: TReturn
): CaptureEvent<T, TReturn, TNext> {
  return captureCall({ called: "return", returnValue }, () =>
    generator.return(returnValue)
  );
}

export function captureThrowCall<T, TReturn, TNext>(
  generator: Generator<T, TReturn, TNext>,
  thrownValue: unknown
): CaptureEvent<T, TReturn, TNext> {
  return captureCall({ called: "throw", thrownValue }, () =>
    generator.throw(thrownValue)
  );
}
