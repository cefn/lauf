/* eslint-disable @typescript-eslint/ban-types */
import type { castDraft, Draft } from "immer";
import { RootState } from "./store";

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
export type Immutable<T> = T extends object ? ImmutableIndex<T> : T;

/** Recursive Readonly implementation for any (indexable) [[RootState]] such as
 * an array or object */
type ImmutableIndex<T> = Readonly<
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
