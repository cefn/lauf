import { Action, createActionProcedure } from "@lauf/lauf-runner";
import { Store, getByPath, setByPath, setByPathMap } from "@lauf/lauf-store";
import type { Immutable } from "@lauf/lauf-store/types/immutable";

class GetStorePath<T> implements Action<Immutable<any>> {
  constructor(readonly store: Store<T>, readonly path: string) {}
  act() {
    return getByPath(this.store, this.path);
  }
}

class SetStorePath<T> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly path: string,
    readonly value: any
  ) {}
  act() {
    return setByPath(this.store, this.path, this.value);
  }
}

class SetStorePathMap<T> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly pathMap: Record<string, any>
  ) {}
  act() {
    return setByPathMap(this.store, this.pathMap);
  }
}

export const getStorePath = createActionProcedure(GetStorePath);
export const setStorePath = createActionProcedure(SetStorePath);
export const setStorePathMap = createActionProcedure(SetStorePathMap);