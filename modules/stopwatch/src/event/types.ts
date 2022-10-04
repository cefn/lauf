/** An event used to capture the lifecycle of a Generator<T, TReturn, TNext> for
 * interrogation or replay
 */
export type CaptureEvent<T, TReturn, TNext> = CalledEvent<TReturn, TNext> &
  GeneratedEvent<T, TReturn>;

/** Infer the CaptureEvent of a GeneratorFunction */
export type GeneratorFnEvent<GeneratorFn> = GeneratorFn extends (
  ...args: unknown[]
) => Generator<infer T, infer TReturn, infer TNext>
  ? CaptureEvent<T, TReturn, TNext>
  : never;

/** Infer the IteratorResult of a GeneratorFunction  */
export type GeneratorFnResult<GeneratorFn> = GeneratorFn extends (
  ...args: unknown[]
) => Generator<infer T, infer TReturn, unknown>
  ? IteratorResult<T, TReturn>
  : never;

/** Discriminated union recording a call made to a generator (triggering various
 * kinds of GeneratedEvent). */
export type CalledEvent<TReturn, TNext> =
  | CalledNext<TNext>
  | CalledReturn<TReturn>
  | CalledThrow;

export interface CalledNext<TNext> {
  called: "next";
  nextValue?: TNext;
}

export interface CalledReturn<TReturn> {
  called: "return";
  returnValue: TReturn;
}

export interface CalledThrow<Thrown = unknown> {
  called: "throw";
  thrownValue: Thrown;
}

/** Discriminated union recording a generator iteration (triggered by various
 * kinds of CalledEvent) */
export type GeneratedEvent<T, TReturn> =
  | GeneratedYield<T>
  | GeneratedReturn<TReturn>
  | GeneratedThrow;

export interface GeneratedYield<T> {
  generated: "yield";
  result: {
    done?: false;
    value: T;
  };
}

export interface GeneratedReturn<TReturn> {
  generated: "return";
  result: {
    done: true;
    value: TReturn;
  };
}

export interface GeneratedThrow<T = unknown> {
  generated: "throw";
  thrown: T;
}
