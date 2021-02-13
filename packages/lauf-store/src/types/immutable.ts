import produce, { Draft } from "immer";

interface ImmutableArray<T> extends ReadonlyArray<Immutable<T>> {}

type ImmutableObject<T> = {
  readonly [P in keyof T]: Immutable<T[P]>;
};

export type Immutable<T> = T extends (infer R)[]
  ? ImmutableArray<R>
  : T extends object
  ? ImmutableObject<T>
  : T extends string | number | boolean
  ? Readonly<T>
  : never;

export type Editor<T extends Immutable<any>> = (draft: Draft<T>) => void;
