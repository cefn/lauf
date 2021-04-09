import { Action, planOfAction } from "@lauf/lauf-runner";
import { Store, getByPath, setByPath, setByPathMap } from "@lauf/lauf-store";
import type { Immutable } from "@lauf/lauf-store";

export class GetStorePath<T extends object> implements Action<Immutable<any>> {
  constructor(readonly store: Store<T>, readonly path: string) {}
  act() {
    return getByPath(this.store, this.path);
  }
}

export class SetStorePath<T extends object> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly path: string,
    readonly value: any
  ) {}
  act() {
    return setByPath(this.store, this.path, this.value);
  }
}

export class SetStorePathMap<T extends object> implements Action<Immutable<T>> {
  constructor(
    readonly store: Store<T>,
    readonly pathMap: Record<string, any>
  ) {}
  act() {
    return setByPathMap(this.store, this.pathMap);
  }
}

export const getStorePath = planOfAction(GetStorePath);
export const setStorePath = planOfAction(SetStorePath);
export const setStorePathMap = planOfAction(SetStorePathMap);
