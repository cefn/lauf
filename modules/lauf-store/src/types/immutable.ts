import type { Draft } from "immer";

/* eslint-disable @typescript-eslint/ban-types */
/** Recursive implementation of `Readonly<T>`.
 *
 * Flags and enforces immutability of a [[RootState]] and its descendants where
 * new values are [[Store.write|assigned]] to or [[Store.read|retrieved]] from a
 * [[Store]]. The type `Immutable<T>` is equivalent to applying `Readonly<T>` to
 * `T` and its descendant properties, ensuring no change can be made to a state
 * tree.
 *
 * Primitive properties are already immutable by definition. Descendants
 * satisfying [[RootState]] are processed recursively. Other descendants of `T`are
 * omitted from `Immutable<T>`.
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
 * currently Arrays, Tuples, Objects and Functions */
export type RootState =
  | unknown[]
  | Record<string | number | symbol, unknown>
  | ((...args: unknown[]) => unknown);

/** Recursive Readonly implementation for any [[RootState]] */
type ImmutableIndex<T extends RootState> = Readonly<
  {
    [K in keyof T]: Immutable<T[K]>;
  }
>;

/** Function to perform edits on a [[RootState]]. Immer tracks the changes you make to
 * `draft` to create a new [[Immutable]] state based on your existing state tree,
 * preserving as much of the state tree as possible. See
 * {@link https://immerjs.github.io/immer/ | Immer docs} for more detail
 * on the conventions for Immer producers. */
export type Editor<T> = (draft: Draft<Immutable<T>>) => void;

/** The `Draft` type is from the
 * {@link https://immerjs.github.io/immer/api/|Immer API} and is re-exported
 * here. `Draft<T>` is a mutable type, even when `T` is {@link Immutable}. An
 * {@link Editor} callback operates with mutable objects as it manipulates and
 * assigns values. When incorporating immutable values into the next draft state
 * you may need to call {@link castDraft} before making assignments. */
export type { Draft };

/** The `castDraft` function is from the
 * {@link https://immerjs.github.io/immer/api/|Immer API} and is re-exported
 * here. It converts any immutable type to its mutable (Draft) counterpart. This
 * is just a cast and doesn't actually do anything. */
export { castDraft } from "immer";
