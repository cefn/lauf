import type { Draft } from "immer";

export type ImmutableObject<T> = Readonly<
  {
    [K in keyof T]: Immutable<T[K]>;
  }
>;

/* eslint-disable @typescript-eslint/ban-types */
export type Immutable<T> = T extends
  | string
  | number
  | boolean
  | null
  | undefined
  | ((...args: unknown[]) => unknown)
  ? T
  : T extends unknown[] | object
  ? ImmutableObject<T>
  : never;

export type Editor<T> = (draft: Draft<Immutable<T>>) => void;

export type { Draft };
