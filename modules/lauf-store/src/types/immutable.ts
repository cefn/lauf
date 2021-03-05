import type { Draft } from "immer";

// export interface ImmutableArray<T> extends ReadonlyArray<Immutable<T>> {}

type ImmutableTuple<T extends any[]> = Readonly<
  {
    [Index in keyof T]: Immutable<T[Index]>;
  }
>;

export type ImmutableObject<T> = {
  readonly [P in keyof T]: Immutable<T[P]>;
};

export type Immutable<T> = T extends any[]
  ? ImmutableTuple<T>
  : T extends object
  ? ImmutableObject<T>
  : T extends string | number | boolean | null
  ? Readonly<T>
  : never;

export type Editor<T extends Immutable<any>> = (draft: Draft<T>) => void;
