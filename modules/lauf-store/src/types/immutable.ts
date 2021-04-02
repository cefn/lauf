import type { Draft } from "immer";

export type ImmutableObject<T> = Readonly<
  {
    [K in keyof T]: Immutable<T[K]>;
  }
>;

export type Immutable<T> = T extends string | number | boolean | null
  ? T
  : T extends object
  ? ImmutableObject<T>
  : never;

export type Editor<T> = (draft: Draft<Immutable<T>>) => void;

export type { Draft };
