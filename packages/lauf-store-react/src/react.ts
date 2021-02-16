import { BasicStore, Selector, Store } from "@lauf/lauf-store";
import { Immutable } from "@lauf/lauf-store/types/immutable";
import {
  FunctionComponent,
  Context,
  useMemo,
  useContext,
  useState,
  useEffect,
  createContext,
} from "react";

export function useStore<T>(initialTree: Immutable<T>): Store<T> {
  const [store, setStore] = useState(() => {
    return new BasicStore<T>(initialTree);
  });
  const [tree, setTree] = useState(store.getValue());
  useEffect(() => {
    return store.watch((state) => {
      return setTree(state);
    });
  }, [store]);
  return store;
}

export function useSelected<State, Selected = any>(
  store: Store<State>,
  selector: Selector<Immutable<State>, Immutable<Selected>>
) {
  const [selected, setSelected] = useState(() => {
    return selector(store.getValue());
  });
  useEffect(() => {
    const unwatch = store.watch((value: Immutable<State>) => {
      const nextSelected = selector(value);
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
