import { Store, Selector } from "@lauf/lauf-store";
import {
  FunctionComponent,
  Context,
  useMemo,
  useContext,
  useState,
  useEffect,
  createContext,
} from "react";

export function useStore<T>(initialTree: T): Store<T> {
  const [store, setStore] = useState(() => {
    return new Store<T>({ state: initialTree });
  });
  const [tree, setTree] = useState(store.getState());
  useEffect(() => {
    return store.watch((state) => {
      return setTree(state);
    });
  }, [store]);
  return store;
}

export function useSelected<State, Selected = any>(
  store: Store<State>,
  selector: Selector<State, Selected>
) {
  const [selected, setSelected] = useState(() => {
    return selector(store.getState());
  });
  useEffect(() => {
    const unwatch = store.watch((state: State) => {
      const nextSelected = selector(state);
      // if(Object.is(selected, nextSelected)){
      //   return;
      // }
      setSelected(nextSelected);
    });
    return () => {
      unwatch();
    };
  }, [store, selector]);
  return selected;
}

export function createStoreContext<S>(store: Store<S>) {
  return createContext(store);
}

export function createStoreConsumer<In, Out>(
  context: Context<In>,
  selector: Selector<In, Out>
) {
  return ({ children }: { children: FunctionComponent<Out> }) => {
    const state: In = useContext(context);
    const out: Out = selector(state);
    return useMemo(() => children(out), [out]);
  };
}
