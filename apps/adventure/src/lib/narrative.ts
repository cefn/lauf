import { Store } from "@lauf/store";
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

/** An action that displays a passage and awaits clicking 'Next' */
export type Tell = (passage: Passage) => Promise<void>;

/** An action that displays an intro passage and provides a choice to the user,
 * awaits clicking a choice.
 */
export type Prompt = <Choices extends Readonly<[string, string, ...string[]]>>(
  intro: Passage,
  choices: Choices
) => Promise<Choices[number]>;

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
    store.patch((state) => ({
      ...state,
      [flagName]: true,
    }));
    yield* createNarrative();
    return true;
  }
  return false;
}

// TODO change this to use an Immutable array of Choice objects (each having a key, narrative and optionally label )
// return type will be Narrative<Choices[number]['key']>
// this means that the key isn't the whole length of the 'descriptive text'
// Narrative can return chosen key

/** Sequences different narratives depending on the choice made by the user */
export function* visitChosenNarrative<
  Choice extends string,
  Lookup extends { [key in Choice]: NarrativeFn }
>(prompt: Prompt, intro: Passage, lookup: Lookup): Narrative<void> {
  const choices = Object.keys(lookup);
  if (choices.length < 2) {
    throw new Error(`Not enough choices in ${JSON.stringify(lookup)}`);
  }
  const chosenLabel = (yield* step(
    prompt,
    intro,
    choices as [Choice, Choice, ...Choice[]]
  )) as Choice;

  const narrative = lookup[chosenLabel];
  yield* narrative();
}
