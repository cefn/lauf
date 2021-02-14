import { Queue } from "./core/bag";

export type Selector<In, Out> = (state: In) => Out;

export interface ActionClass<Params extends any[], Reaction> {
  new (...params: Params): Action<Reaction>;
}

export interface Action<Reaction> {
  act: () => Reaction | Promise<Reaction>;
}

/** Generator with a next() that accepts the awaited result of
 * its own yielded actions until an outcome is returned.
 */
export type Sequence<Outcome = void, Reaction = any> = Generator<
  Action<Reaction>,
  Outcome,
  Reaction
>;

// export type RootProcedure<Outcome = void, Reaction = any> = () => Sequence<
//   Outcome,
//   Reaction
// >;

/** A configurable sequence factory, as invoked within a 'root' sequence */
export type Procedure<
  Args extends any[] = any[],
  Outcome = void,
  Reaction = any
> = (...args: Args) => Sequence<Outcome, Reaction>;

/**  A 'root' sequence factory (no-arg signature)  */
export type RootProcedure<Outcome = void, Reaction = any> = Procedure<
  [],
  Outcome,
  Reaction
>;

export interface Sink<T> {
  put(item: T): any;
}

export interface Bag<T> {
  put(item: T): boolean;
  take(): T | Emptiness;
  count(): number;
  maxCount(): number;
}

export interface Watchable<T> {
  watch(watcher: Watcher<T>): Unwatch;
}

export type Watcher<T> = (item: T) => any;

export type Unwatch = () => void;

export type Source<T> = (sink: Watcher<T>) => Unwatch;

export type PathMap<V = any> = { [key in string]: V };

type Event<T> = T | End;

export const END = ["end"] as const;
export type End = typeof END;
export function isEnd(value: any): value is End {
  return value === END;
}

export const EXPIRY = ["expiry"] as const;
export type Expiry = typeof EXPIRY;
export function isExpiry(value: any): value is Expiry {
  return value === EXPIRY;
}

export const EMPTY = ["empty"] as const;
export type Emptiness = typeof EMPTY;
export function isEmpty(value: any): value is Emptiness {
  return value === EMPTY;
}
