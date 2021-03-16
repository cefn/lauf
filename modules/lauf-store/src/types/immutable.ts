import type { Draft } from "immer";

export type ImmutableObject<T> = Readonly<
  {
    [K in keyof T]: Immutable<T[K]>;
  }
>;

export type Immutable<T> = T extends any[] | object
  ? ImmutableObject<T>
  : T extends string | number | boolean | null
  ? Readonly<T>
  : never;

export type Editor<T extends Immutable<any>> = (draft: Draft<T>) => void;

export type { Draft };
