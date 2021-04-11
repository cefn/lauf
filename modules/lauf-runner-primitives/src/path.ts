import { Action, planOfAction } from "@lauf/lauf-runner";
import { Store, getByPath, setByPath, setByPathMap } from "@lauf/lauf-store";
import type { Immutable } from "@lauf/lauf-store";

export class GetStorePath<State extends object>
  implements Action<Immutable<any>> {
  constructor(readonly store: Store<State>, readonly path: string) {}
  act() {
    return getByPath(this.store, this.path);
  }
}

export class SetStorePath<State extends object>
  implements Action<Immutable<State>> {
  constructor(
    readonly store: Store<State>,
    readonly path: string,
    readonly value: any
  ) {}
  act() {
    return setByPath(this.store, this.path, this.value);
  }
}

export class SetStorePathMap<State extends object>
  implements Action<Immutable<State>> {
  constructor(
    readonly store: Store<State>,
    readonly pathMap: Record<string, any>
  ) {}
  act() {
    return setByPathMap(this.store, this.pathMap);
  }
}

export const getStorePath = planOfAction(GetStorePath);
export const setStorePath = planOfAction(SetStorePath);
export const setStorePathMap = planOfAction(SetStorePathMap);
