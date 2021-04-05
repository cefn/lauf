import { BasicStore, Selector, Store } from "@lauf/lauf-store";
import { Immutable } from "@lauf/lauf-store";
import { useState, useEffect, createContext } from "react";

export function useStore<T extends object>(
  initialTree: Immutable<T>
): Store<T> {
  const [store, setStore] = useState(() => {
    return new BasicStore<T>(initialTree);
  });
  const [tree, setTree] = useState(store.read());
  useEffect(() => {
    return store.watch((state) => {
      return setTree(state);
    });
  }, [store]);
  return store;
}

export function useSelected<State, Selected>(
  store: Store<State>,
  selector: Selector<State, Selected>
) {
  let [selected, setSelected] = useState(() => {
    return selector(store.read());
  });
  useEffect(() => {
    let lastSelected = selected;
    const unwatch = store.watch((value: Immutable<State>) => {
      const nextSelected = selector(value);
      if (Object.is(lastSelected, nextSelected)) {
        return;
      }
      lastSelected = nextSelected; //sync version in closure
      setSelected(nextSelected); //set version in state
    });
    return unwatch;
  }, [store, selector]);
  return selected;
}

export function createStoreContext<S>(store: Store<S>) {
  return createContext(store);
}
