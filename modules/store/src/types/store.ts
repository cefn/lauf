/* eslint-disable @typescript-eslint/ban-types */
import type { Immutable, Editor } from "./immutable";
import { WatchableState } from "./watchable";

/** A `Store` keeps an Immutable [[RootState]] - any array, tuple or object -
 * which can be changed and monitored for changes to drive an app. Make a new
 * `Store` by calling [[createStore]] with an `initialState`.
 *
 * ## Watching State
 *
 * Assigning a new [[Immutable]] `RootState` using [[Store.write]] notifies
 * [[Watcher|Watchers]] previously subscribed using [[Store.watch]]. This
 * mechanism ensures that app logic and renderers can track the latest state.
 *
 * ## Editing State
 *
 * Changes to state are normally 'drafted' by calling [[Store.edit]] and passing
 * an editor callback function. In this function you can make changes to state
 * as if it ***wasn't*** [[Immutable]], then [[write]] will be called on your
 * behalf with the equivalent [[Immutable]] result. See [[Editor]] for more
 * about drafting.
 *
 * Alternatively you can construct a new `Immutable` value yourself, then
 * explicitly call [[Store.write]] to update the state.
 *
 * ## Immutable State: Motivation
 *
 * Never modifying the state tree means when the state or a
 * [[Selector|selected]] branch of the state is the same ***item*** as before,
 * it is guaranteed to contain all the same ***values*** as before. This
 * guarantee is crucial.
 *
 * Immutability allows Watchers you write, renderers like
 * [[https://reactjs.org/|React]] and memoizers like
 * [[https://github.com/reduxjs/reselect|Reselect]] or React's
 * [useMemo()](https://reactjs.org/docs/hooks-reference.html#usememo) to use
 * 'shallow equality checking'. They can efficiently check when changes to an
 * item should trigger a re-render or recompute - simply
 * when`Object.is(prevItem,nextItem)===false`.
 *
 * Immutability eliminates bugs and race conditions in state-change event
 * handlers. Handlers notified of a change effectively have a snapshot of state.
 * You don't have to handle cases where other code changed the state again
 * before your handler read the data.
 *
 * Finally, Immutability establishes a basis for advanced debugging techniques
 * such as time-travel debugging since every state change notification includes
 * a momentary snapshot of the app state which can be stored indefinitely.
 *
 * *Note whenever you [[Editor|edit]] data in the Store, this necessarily
 * operates over the current, not historical state, but this reconciliation is
 * unavoidable and manageable.*
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

/** Defines the set of possible state types for a [[Store]],
 * usually the top level State 'container' is either an
 * Array, Tuple, or keyed Object */
export type RootState = object;

/** An item satisfying type constraints of [[RootState]] but where a child item
 * at `Key` ***also*** satisfies `RootState`. A Store with a
 * [[PartitionableState]] can therefore be partitioned into a child [[Store]] by
 * `Key`.
 *
 * Partitioning enables hierarchy and logical isolation of a [[Store]], so that
 * higher-level stores can be composed of multiple lower-level stores. Logic
 * relying on some `Store<T>` need not know whether `<T>` is the whole app state
 * or just some part of it.
 *
 * Partitioning can also make eventing more efficient. When a parent Store's
 * `RootState` changes, implementations can omit notifications for all
 * [[Watcher|Watchers]] of a child partition if the child [[RootState]] has not
 * changed, meaning no value within the child partition has changed.
 *
 * See also [[createStorePartition]].
 */
export type PartitionableState<Key extends string | number | symbol> =
  RootState & { [k in Key]: RootState };
