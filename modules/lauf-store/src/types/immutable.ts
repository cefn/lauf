import type { Draft } from "immer";

export type ImmutableObject<T> = Readonly<
  {
    [K in keyof T]: Immutable<T[K]>;
  }
>;

export type Immutable<T> = T extends
  | ((...args: any[]) => any)
  | string
  | number
  | boolean
  | null
  | undefined
  ? T
  : T extends any[] | object
  ? ImmutableObject<T>
  : never;

export type Editor<T> = (draft: Draft<Immutable<T>>) => void;

export type { Draft };
