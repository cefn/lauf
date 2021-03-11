import type { Draft } from "immer";

export type ImmutableObject<T> = Readonly<
  {
    [P in keyof T]: Immutable<T[P]>;
  }
>;

export type Immutable<T> = T extends any[]
  ? ImmutableObject<T>
  : T extends object
  ? ImmutableObject<T>
  : T extends string | number | boolean | null
  ? Readonly<T>
  : never;

export type Editor<T extends Immutable<any>> = (draft: Draft<T>) => void;
