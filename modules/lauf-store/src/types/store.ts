/* eslint-disable @typescript-eslint/ban-types */
import type { Immutable, Editor } from "./immutable";
import { WatchableState } from "./watchable";

/** Suitable state container for a [[Store]],
 * Includes for example Arrays, Tuples, Objects, Functions */
export type RootState = object;

/** A `Store` keeps an Immutable [[RootState]] - any array, tuple or object - which can be
 * changed and monitored for changes to drive an app. Make a new `Store` by
 * calling [[createStore]] with an `initialState`.
 *
 * ## Immutable State
 *
 * Never modifying the state tree
 * means when the state or a [[Selector|selected]] branch of the state is the
 * same ***item*** as before, it is guaranteed to contain all the same
 * ***values*** as before.
 *
 * This guarantee enables Watchers, renderers like
 * [[https://reactjs.org/|React]] and memoizers like
 * [[https://github.com/reduxjs/reselect|Reselect]] to efficiently re-render or
 * recompute ***only*** when changes to an item make it necessary - that is,
 * when `Object.is(prevItem,nextItem)===false`.
 *
 * ## Watching State
 *
 * Assigning a new `RootState` using [[Store.write]] notifies
 * [[Watcher|Watchers]] previously subscribed using [[Store.watch]]. This
 * mechanism ensures that app logic and renderers can track the latest state.
 *
 * ## Editing State
 *
 * Changes to state are normally 'drafted' by calling [[Store.edit]] and passing an
 * callback [[Editor]] function. See [[Editor]] for more about
 * drafting.
 *
 * Alternatively you can construct a new `Immutable` value yourself, then
 * explicitly call [[Store.write]] to update the state.
 *
 */
export interface Store<State extends RootState>
  extends WatchableState<Immutable<State>> {
  /** Accepts an [[Editor]] function which will be passed a `draft` of the
   * current state. The function can manipulate the draft state using normal
   * javascript assignments and operations. When it returns, a new Immutable
   * state is passed to [[write]] which matches those changes.
   * @param editor A function to draft the next state
   * @returns The resulting new [[Immutable]] state. */
  edit: (editor: Editor<State>) => Immutable<State>;

  /** Derive some sub-part or computed value from the current state using a
   * [[Selector]]. A bound method for convenience that is equivalent to
   * `selector(store.read())`.
   * @param selector A [[Selector]] which will be passed the current state.
   * @returns The value extracted or computed by the selector.
   */
  select: <Selected>(
    selector: Selector<State, Selected>
  ) => Immutable<Selected>;
}

/** Function deriving some sub-part or computed value from a [[RootState]]. */
export type Selector<State extends RootState, Selected> = (
  state: Immutable<State>
) => Immutable<Selected>;
