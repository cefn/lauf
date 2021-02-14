import produce, { Draft } from "immer";
//ALSO consider object-path-immutable or lodash-redux-immutable on npm?

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

export type Editor<T> = (draft: Draft<T>) => void;

export function edit<T>(state: T, editor: Editor<T>): T {
  return (produce<T>(state, editor) as unknown) as T;
}
