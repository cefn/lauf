import type { Draft } from "immer";

export interface ImmutableArray<T> extends ReadonlyArray<Immutable<T>> {}

export type ImmutableObject<T> = {
  readonly [P in keyof T]: Immutable<T[P]>;
};

export type Immutable<T> = T extends (infer R)[]
  ? ImmutableArray<R>
  : T extends object
  ? ImmutableObject<T>
  : T extends string | number | boolean | null
  ? Readonly<T>
  : never;

export type Editor<T extends Immutable<any>> = (draft: Draft<T>) => void;
