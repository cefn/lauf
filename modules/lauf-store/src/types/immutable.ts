import type { castDraft, Draft } from "immer";

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

/** Function to perform edits on a [[RootState]]. Immer detects the changes you
 * make to the `draft` proxy inside the [[Editor]] function and creates a new
 * [[Immutable]] state preserving as much of the existing state tree as possible
 * while guaranteeing to leave the previous state tree unchanged.
 *
 * See {@link https://immerjs.github.io/immer/ | Immer docs} for more detail on
 * the conventions for Immer `producers` and on `castDraft`.
 *
 * @param draft A mutable proxy of a [[Store]]'s existing `Immutable` state,
 * used to compose its next state without changing the original.
 * @param castDraft Immer function unsafely casting `Immutable` values to
 * [[Draft]] allowing parts of the last state to be assigned to the new `draft`.
 * */
export type Editor<T> = (
  draft: Draft<Immutable<T>>,
  toDraft: typeof castDraft
) => void;
