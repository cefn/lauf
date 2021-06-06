import type { Immutable, RootState, Editor } from "./immutable";
import { WatchableValue } from "./watchable";

/** A `Store` keeps a [[RootState]] - any array, tuple or object- which can be
 * updated and monitored for updates to drive an app.
 *
 * The RootState is an [[Immutable]]. Instead of changing it, we always replace
 * it by a new state which includes the changes.
 *
 * For convenience, changes can be made to the state by calling [[Store.edit]]
 * and passing an [[Editor]] function. This function is called with a [[Draft]]
 * of the current state, and can use everyday 'mutable' javascript operations to
 * change it.
 *
 * When your Editor function returns,
 * {@link https://immerjs.github.io/immer/ | Immer}) [[Store.write|writes]]
 * a new Immutable state that incorporates only your newly changed values, with
 * replacements of any parent objects or arrays which referenced the previous
 * values them. Everything else is left alone.
 *
 * Every new state will be notified to the callbacks subscribed using
 * [[Store.watch]]). (see [[WatchableValue]] and [[Watcher]])
 *
 * Immutable state means references represent a permanent record of app state
 * transitions. If the new RootState or a [[Selector|selected]] part of the
 * state has the same identity as before, it therefore has the same value as
 * before. This enables renderers like [[https://reactjs.org/|React]] and
 * memoizers like [[https://github.com/reduxjs/reselect|Reselect]] to only
 * re-render or recompute when necessary.
 */
export interface Store<State extends RootState>
  extends WatchableValue<Immutable<State>> {
  /** Hello */
  edit: (editor: Editor<State>) => Immutable<State>;
  /** Hmmm */
  select: <Selected>(
    selector: Selector<State, Selected>
  ) => Immutable<Selected>;
  // partition: (key: keyof State) => Store<State[typeof key]>;
}

/** Function deriving some sub-part or computed value from a [[RootState]]. */
export type Selector<State extends RootState, Selected> = (
  state: Immutable<State>
) => Immutable<Selected>;
