import type { castDraft, Draft } from "immer";

/** Recursive implementation of `Readonly<T>`.
 *
 * Flags and enforces immutability of a [[RootState]] and its descendants for
 * values [[Store.write|assigned to]]  or [[Store.read|retrieved from]] a
 * [[Store]]. The type `Immutable<T>` is equivalent to applying `Readonly<T>` to
 * `T` and its descendant properties, telling the compiler that no change should
 * be made anywhere in a Store's state tree.
 *
 * Primitive properties are already immutable by definition. Descendants
 * satisfying [[RootState]] are processed recursively. Other descendants of
 * `T`are omitted.
 *
 */
export type Immutable<T> = T extends
  | string
  | number
  | symbol
  | boolean
  | null
  | undefined
  ? T
  : T extends RootState
  ? ImmutableIndex<T>
  : never;

/** Suitable state containers for a [[Store]],
 * for example Arrays, Tuples, Objects */
export type RootState =
  | unknown[]
  | Record<string | number | symbol, unknown>
  | ((...args: unknown[]) => unknown);

/** A [[RootState]] which can be partitioned into a child [[RootState]] by
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
 * changed, meaning no value within the child partition has changed. See
 */
export type PartitionableState<
  Key extends string | number | symbol
> = RootState & { [k in Key]: RootState };

/** Recursive Readonly implementation for any [[RootState]] */
type ImmutableIndex<T extends RootState> = Readonly<
  {
    [K in keyof T]: Immutable<T[K]>;
  }
>;

type CastDraft = typeof castDraft;

/**  A function to perform edits on a [[RootState]]. The editor is passed a
 * `draft` - a mutable proxy of the Store's current `Immutable` `RootState`.
 *
 * Changes made to the mutable `draft` proxy within the editor are tracked. When
 * it returns, {@link https://immerjs.github.io/immer/ | Immer} efficiently
 * composes a new [[Immutable]] state to reflect the drafted changes, leaving
 * the old state intact. The new state is passed to [[Store.write]].
 *
 * Note: Immer's `castDraft` enables parts of the last `Immutable` state to be
 * assigned to the new mutable `draft` state for convenience. However you must
 * avoid actually mutating any part of the last state.
 *
 * See {@link https://immerjs.github.io/immer/ | Immer docs} for more detail on
 * the conventions for Immer `producers`.
 *
 * @param draft A mutable proxy of a [[Store]]'s existing `Immutable` state,
 * used to compose the next state.
 * @param castDraft Unsafely casts `Immutable` references to mutable to use them
 * in the next draft.
 * */
export type Editor<T> = (
  draft: Draft<Immutable<T>>,
  castDraft: CastDraft
) => void;
