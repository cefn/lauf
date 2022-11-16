import { Immutable, Store } from "@lauf/store";
import { Sequence, step } from "@lauf/stepmachine";

/** Definitions for @lauf/stepmachine for a simple Interactive Fiction engine.
 * Tell and Prompt are asynchronous operations to present information on screen
 * and wait for input which can be performed or mocked by a stepmachine.
 *
 * A NarrativeFn is a plan for an interactive story -  a synchronous generator
 * of Tell | Prompt commands. In a production runtime this routine would simply
 * execute every yielded command one after the other. However, in a dev runtime,
 * these yield-points enable commands, return values and snapshots of state to
 * be captured for interactive, time-travel debugging of the routine.
 */

export type NarrativeOp = Tell | Prompt;

/** A passage of content (string or React fragment) that can be presented. */
export type Passage = string | JSX.Element;

export interface Choice {
  name: string;
  passage: Passage;
  narrative?: NarrativeFn;
}

/** Type ensures at least two choices */
export type Choices = Immutable<[Choice, Choice, ...Choice[]]>;

/** An action that displays a passage and awaits clicking 'Next' */
export type Tell = (passage: Passage) => Promise<void>;

/** An action that displays an intro passage and provides a choice to the user,
 * awaits clicking a choice.
 */
export type Prompt = <C extends Choices>(
  intro: Passage,
  ...choices: C
) => Promise<C[number]>;

/** A stepmachine Sequence that will Tell passages and Prompt choices and return
 * some outcome - an atom of interactive fiction. */
export type Narrative<Rtn> = Sequence<Rtn, Tell | Prompt>;

/** A factory for a Narrative. */
export type NarrativeFn = () => Narrative<void>;

/** Visits narrative if named boolean in the store is false (also setting the boolean) */
export function* lazyVisitNarrative<
  FlaggedState extends { [k in FlagName]: boolean },
  FlagName extends string
>(
  store: Store<FlaggedState>,
  flagName: FlagName,
  createNarrative: NarrativeFn
): Narrative<boolean> {
  if (!store.read()[flagName]) {
    store.write({
      ...store.read(),
      [flagName]: true,
    });
    yield* createNarrative();
    return true;
  }
  return false;
}
