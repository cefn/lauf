import lodashGet from "lodash/get";
import lodashSet from "lodash/set";
import type { Store } from "../types/store";
import type { Immutable } from "../types/immutable";

type PathMap<V> = Record<string, V>;

export function getByPath<T>(store: Store<T>, path: string): Immutable<any> {
  return lodashGet(store.read(), path);
}

export function setByPath<T extends object>(
  store: Store<T>,
  path: string,
  value: any
): Immutable<T> {
  return store.edit((draft) => {
    lodashSet(draft, path, value);
  });
}

export function setByPathMap<T extends object, V>(
  store: Store<T>,
  pathMap: PathMap<V>
): Immutable<T> {
  return store.edit((draft) => {
    for (const [path, value] of Object.entries(pathMap)) {
      lodashSet(draft, path, value);
    }
  });
}
