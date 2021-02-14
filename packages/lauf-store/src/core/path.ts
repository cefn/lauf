import lodashGet from "lodash/get";
import lodashSet from "lodash/set";
import type { Store } from "../types/store";
import type { Immutable } from "../types/immutable";

type PathMap<V = any> = Record<string, V>;

export function setStorePath<T>(
  store: Store<T>,
  path: string,
  value: any
): Immutable<T> {
  return store.editValue((draft) => {
    lodashSet(draft, path, value);
  });
}

export function getStorePath<T>(store: Store<T>, path: string): Immutable<any> {
  return lodashGet(store.getValue(), path);
}

export function setStorePathMap<T, V = any>(
  store: Store<T>,
  pathMap: PathMap<V>
): Immutable<T> {
  return store.editValue((draft) => {
    for (const [path, value] of Object.entries(pathMap)) {
      lodashSet(draft, path, value);
    }
  });
}
