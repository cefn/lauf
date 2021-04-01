import type { Draft } from "immer";
import type { DeepReadonly } from "ts-essentials";

type Immutable<T> = DeepReadonly<T>;

type Editor<T> = (draft: Draft<Immutable<T>>) => void;

export type { Immutable, Draft, Editor };
