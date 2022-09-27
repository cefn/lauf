/**
 * [[include:modules/store-react/README.md]]
 *
 * @module @lauf/store-react
 */
import {
  createStore,
  Store,
  Selector,
  Immutable,
  RootState,
  Watcher,
} from "@lauf/store";
import { useState, useMemo, useEffect } from "react";

/** When the component is first mounted, this hook creates and returns a a new
 * long-lived [[Store]] initialised with `initialState`.
 *
 * In later renders the hook will always return the same `Store`, It
 * deliberately doesn't force a component refresh when the Store state changes.
 * To track changes in the store, see [[useSelected]] or [[useRootState]].
 *
 * @param initialState
 * @returns A lazily-created [[Store]]
 */
export function useStore<T extends RootState>(initialState: Immutable<T>) {
  const [store] = useState(() => {
    return createStore(initialState);
  });
  return store;
}

/** A hook for tracking a subpart or a computed value derived from the
 * [[RootState]] of a [[Store]] by a [[Selector]] function.
 *
 * This hook calls `selector` with the `Store`'s `RootState` and returns the
 * derived value. Then it [[Watcher|watches]] the store, calling the `selector`
 * again for every change to the `RootState`. If the value returned by
 * `selector` is not identical to the last saved value, a re-render will be
 * triggered (and this hook will return the new value).
 *
 * If your `selector` constructs a new data structure based on the `RootState`,
 * (rather than just selecting some part of the [[Immutable]] `RootState` or
 * calculating a primitive value), then it might return a non-identical value
 * even when nothing has changed. Computed data structures should be
 * [memoized](https://github.com/reduxjs/reselect#creating-a-memoized-selector)
 * to minimise component refreshes.
 *
 * See [[Selector]]
 */
export function useSelected<State extends RootState, Selected>(
  store: Store<State>,
  selector: Selector<State, Selected>
) {
  let cachedState = store.read();
  let [cachedSelected, setSelected] = useState(() => {
    return selector(cachedState);
  });
  useEffect(() => {
    // watcher will be notified for any new state
    const watcher = (nextState: Immutable<State>) => {
      cachedState = nextState; // update closure
      const nextSelected = selector(cachedState);
      if (Object.is(cachedSelected, nextSelected)) {
        return;
      }
      cachedSelected = nextSelected; // update closure
      setSelected(nextSelected); // notify react
    };
    // subscribe to future state changes
    const unwatch = store.watch(watcher);
    // detect changes not relayed to watcher, e.g.
    // state changed between useSelected and useEffect
    // state changed because store has changed
    const tickState = store.read();
    if (!Object.is(cachedState, tickState)) {
      watcher(tickState);
    }
    // unsubscribe on unmount or change of store, selector
    return unwatch;
  }, [store, selector]);
  return cachedSelected;
}

/** A hook for tracking the [[RootState]] of a [[Store]]. Note, this forces a reload
 * of the component when ***any*** part of the state tree changes. You probably want
 * [[useSelected]] instead.
 * @param store The [[Store]] to track.
 */
export function useRootState<State extends RootState>(store: Store<State>) {
  const { read, watch } = store;
  const [rootState, setRootState] = useState(read);
  useEffect(() => {
    const unwatch = watch((nextRootState) => {
      setRootState(nextRootState); // set version in state
    });
    return unwatch;
  }, [store]);
  return rootState;
}
